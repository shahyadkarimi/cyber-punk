import { NextResponse } from "next/server"
import { scanWebsite } from "@/lib/vulnerability-scanner"
import { headers } from "next/headers"
import { rateLimiter } from "@/lib/rate-limiter"
import { cache } from "@/lib/cache"
import { captchaGenerator } from "@/lib/captcha"

// Cache TTL for vulnerability scans (1 hour)
const SCAN_CACHE_TTL = 3600000

export async function POST(request: Request) {
  try {
    // Get client IP for rate limiting
    const headersList = headers()
    const forwardedFor = (await headersList).get("x-forwarded-for")
    const clientIp = forwardedFor ? forwardedFor.split(",")[0] : "unknown"
    const userAgent = (await headersList).get("user-agent") || "unknown"

    const { url, selectedCms, captchaId, captchaAnswer } = await request.json()

    // Handle CAPTCHA verification
    if (captchaId && captchaAnswer) {
      const isValid = captchaGenerator.verifyCaptcha(captchaId, captchaAnswer)

      if (isValid) {
        // Mark the client as having verified a CAPTCHA
        rateLimiter.setCaptchaVerified(clientIp)

        return NextResponse.json({ success: true })
      } else {
        return NextResponse.json({ success: false, error: "Invalid CAPTCHA" }, { status: 400 })
      }
    }

    if (!url) {
      return NextResponse.json({ error: "URL is required" }, { status: 400 })
    }

    // Check rate limit
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
            "X-RateLimit-Limit": "5",
            "X-RateLimit-Remaining": "0",
            "X-RateLimit-Reset": resetTime,
          },
        },
      )
    }

    // Add rate limit headers to all responses
    const remainingRequests = rateLimiter.getRemainingRequests(clientIp)
    const resetTime = new Date(rateLimiter.getResetTime(clientIp)).toISOString()
    const responseHeaders = {
      "X-RateLimit-Limit": "5",
      "X-RateLimit-Remaining": remainingRequests.toString(),
      "X-RateLimit-Reset": resetTime,
    }

    // Check cache first
    const cacheKey = `vuln-scan:${url}:${selectedCms || "auto"}`
    const cachedResult = cache.get(cacheKey)

    if (cachedResult) {
      console.log(`Cache hit for vulnerability scan: ${url}`)
      return NextResponse.json(cachedResult, { headers: responseHeaders })
    }

    // Perform the scan
    const scanResult = await scanWebsite(url, selectedCms)

    // Cache the result
    cache.set(cacheKey, scanResult, SCAN_CACHE_TTL)

    return NextResponse.json(scanResult, { headers: responseHeaders })
  } catch (error) {
    console.error("API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
