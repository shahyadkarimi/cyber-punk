import { NextResponse } from "next/server"
import { rateLimiter } from "@/lib/rate-limiter"
import { cache, CACHE_TTL } from "@/lib/cache"
import { captchaGenerator } from "@/lib/captcha"
import { resultLogger } from "@/lib/result-logger"
import { detectCMS } from "@/lib/cms-detection"
import { headers } from "next/headers"

// API key for the service
const API_KEY = "b37150c809c99870dd4ced2dd0316385"

export async function POST(request: Request) {
  try {
    // Get client IP for rate limiting
    const headersList = headers()
    const forwardedFor = headersList.get("x-forwarded-for")
    const clientIp = forwardedFor ? forwardedFor.split(",")[0] : "unknown"
    const userAgent = headersList.get("user-agent") || "unknown"

    const body = await request.json()
    const { url, action, captchaId, captchaAnswer } = body

    // Handle CAPTCHA verification
    if (action === "verify_captcha" && captchaId && captchaAnswer) {
      const isValid = captchaGenerator.verifyCaptcha(captchaId, captchaAnswer)

      if (isValid) {
        // Mark the client as having verified a CAPTCHA
        rateLimiter.setCaptchaVerified(clientIp)

        return NextResponse.json({ success: true })
      } else {
        return NextResponse.json({ success: false, error: "Invalid CAPTCHA" }, { status: 400 })
      }
    }

    // Handle CAPTCHA generation
    if (action === "get_captcha") {
      const challenge = captchaGenerator.generateChallenge()

      // Don't expose the answer
      const { answer, ...safeChallenge } = challenge

      return NextResponse.json(safeChallenge)
    }

    if (!url) {
      return NextResponse.json({ error: "URL is required" }, { status: 400 })
    }

    // If it's a CMS check and bypassRateLimit is true, skip rate limiting
    if (action === "cms" && body.bypassRateLimit === true) {
      // Skip rate limiting for CMS detection
    } else {
      // Apply the existing rate limiting logic
      if (rateLimiter.isRateLimited(clientIp)) {
        // If CAPTCHA is required, return a challenge
        if (rateLimiter.requiresCaptcha(clientIp)) {
          const challenge = captchaGenerator.generateChallenge()

          // Don't expose the answer
          const { answer, ...safeChallenge } = challenge

          return NextResponse.json(
            {
              error: "Rate limit exceeded. Please complete the CAPTCHA to continue.",
              captchaRequired: true,
              captcha: safeChallenge,
            },
            { status: 429 },
          )
        }

        const resetTime = new Date(rateLimiter.getResetTime(clientIp)).toISOString()
        return NextResponse.json(
          {
            error: "Rate limit exceeded. Please try again later.",
            resetAt: resetTime,
          },
          {
            status: 429,
            headers: {
              "X-RateLimit-Limit": "10",
              "X-RateLimit-Remaining": "0",
              "X-RateLimit-Reset": resetTime,
            },
          },
        )
      }
    }

    // Add rate limit headers to all responses
    const remainingRequests = rateLimiter.getRemainingRequests(clientIp)
    const resetTime = new Date(rateLimiter.getResetTime(clientIp)).toISOString()
    const responseHeaders = {
      "X-RateLimit-Limit": "10",
      "X-RateLimit-Remaining": remainingRequests.toString(),
      "X-RateLimit-Reset": resetTime,
    }

    // Start timing for performance logging
    const startTime = Date.now()

    if (action === "reverse") {
      // Check cache first
      const cacheKey = `reverse:${url}`
      const cachedResult = cache.get<{ domains: string[] }>(cacheKey)

      if (cachedResult) {
        console.log(`Cache hit for reverse lookup: ${url}`)

        // Log the cached result
        resultLogger.log({
          timestamp: Date.now(),
          action: "reverse_lookup",
          query: url,
          results: cachedResult.domains,
          clientIp,
          userAgent,
          processingTime: Date.now() - startTime,
        })

        return NextResponse.json(cachedResult, { headers: responseHeaders })
      }

      // Get IP from URL if needed
      const ip = await getIpFromUrl(url)

      // Call the reverse IP lookup API
      const apiUrl = `https://api.xreverselabs.org/itsuka?apiKey=${API_KEY}&ip=${ip}`

      const response = await fetch(apiUrl, {
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
        },
      })

      if (!response.ok) {
        return NextResponse.json(
          { error: `API returned ${response.status}` },
          { status: response.status, headers: responseHeaders },
        )
      }

      const data = await response.json()

      if (!data.domains || !Array.isArray(data.domains)) {
        return NextResponse.json({ domains: [] }, { headers: responseHeaders })
      }

      // Cache the result
      const result = { domains: data.domains }
      cache.set(cacheKey, result, CACHE_TTL.REVERSE_LOOKUP)

      // Log the result
      resultLogger.log({
        timestamp: Date.now(),
        action: "reverse_lookup",
        query: url,
        results: data.domains,
        clientIp,
        userAgent,
        processingTime: Date.now() - startTime,
      })

      return NextResponse.json(result, { headers: responseHeaders })
    } else if (action === "subdomain") {
      // Check cache first
      const cacheKey = `subdomain:${url}`
      const cachedResult = cache.get<{ subdomains: string[] }>(cacheKey)

      if (cachedResult) {
        console.log(`Cache hit for subdomain lookup: ${url}`)

        // Log the cached result
        resultLogger.log({
          timestamp: Date.now(),
          action: "subdomain_lookup",
          query: url,
          results: cachedResult.subdomains,
          clientIp,
          userAgent,
          processingTime: Date.now() - startTime,
        })

        return NextResponse.json(cachedResult, { headers: responseHeaders })
      }

      // Clean the domain input
      const domain = url.replace(/^https?:\/\//, "")

      // Call the crt.sh API
      const crtUrl = `https://crt.sh/?q=%25.${domain}&output=json`

      const response = await fetch(crtUrl, {
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
        },
      })

      if (!response.ok) {
        return NextResponse.json(
          { error: `API returned ${response.status}` },
          { status: response.status, headers: responseHeaders },
        )
      }

      const data = await response.json()
      const subdomains = new Set<string>()

      if (Array.isArray(data)) {
        for (const entry of data) {
          if (entry.name_value) {
            const domains = entry.name_value.split("\n")
            for (const subdomain of domains) {
              subdomains.add(subdomain.trim())
            }
          }
        }
      }

      // Cache the result
      const result = { subdomains: Array.from(subdomains) }
      cache.set(cacheKey, result, CACHE_TTL.SUBDOMAIN_LOOKUP)

      // Log the result
      resultLogger.log({
        timestamp: Date.now(),
        action: "subdomain_lookup",
        query: url,
        results: Array.from(subdomains),
        clientIp,
        userAgent,
        processingTime: Date.now() - startTime,
      })

      return NextResponse.json(result, { headers: responseHeaders })
    } else if (action === "cms") {
      // Check cache first
      const cacheKey = `cms:${url}`
      const cachedResult = cache.get<{ url: string; cms: string; confidence: number; vulnerabilities?: string[] }>(
        cacheKey,
      )

      if (cachedResult) {
        console.log(`Cache hit for CMS check: ${url}`)

        // Log the cached result
        resultLogger.log({
          timestamp: Date.now(),
          action: "cms_check",
          query: url,
          results: cachedResult.cms,
          clientIp,
          userAgent,
          processingTime: Date.now() - startTime,
        })

        return NextResponse.json(cachedResult, { headers: responseHeaders })
      }

      // Use enhanced CMS detection
      const cmsResult = await detectCMS(url)

      // Cache the result
      const result = { url, ...cmsResult }
      cache.set(cacheKey, result, CACHE_TTL.CMS_CHECK)

      // Log the result
      resultLogger.log({
        timestamp: Date.now(),
        action: "cms_check",
        query: url,
        results: cmsResult.cms,
        clientIp,
        userAgent,
        processingTime: Date.now() - startTime,
      })

      return NextResponse.json(result, { headers: responseHeaders })
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400, headers: responseHeaders })
  } catch (error) {
    console.error("API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

/**
 * Helper function to get IP from URL
 */
async function getIpFromUrl(url: string): Promise<string> {
  // Check cache first
  const cacheKey = `ip:${url}`
  const cachedIp = cache.get<string>(cacheKey)

  if (cachedIp) {
    console.log(`Cache hit for IP lookup: ${url}`)
    return cachedIp
  }

  // Clean the URL input
  url = url.replace(/^https?:\/\//, "")

  // If it's already an IP, return it
  const ipPattern = /^(\d{1,3}\.){3}\d{1,3}$/
  if (ipPattern.test(url)) {
    return url
  }

  try {
    // Use DNS lookup service to get IP
    const dnsApi = `https://dns.google/resolve?name=${url}`
    const response = await fetch(dnsApi)
    const data = await response.json()

    if (data.Answer && data.Answer.length > 0) {
      const ip = data.Answer[0].data

      // Cache the result
      cache.set(cacheKey, ip, CACHE_TTL.REVERSE_LOOKUP)

      return ip
    }

    throw new Error("Could not resolve IP")
  } catch (error) {
    console.error("Error getting IP from URL:", error)
    throw new Error("Failed to resolve IP address")
  }
}
