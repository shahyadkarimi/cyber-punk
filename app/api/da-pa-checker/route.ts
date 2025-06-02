import { type NextRequest, NextResponse } from "next/server"
import { getRapidApiHeaders, isRapidApiConfigured, RAPID_API_CONFIG } from "@/lib/api-services"

export async function POST(request: NextRequest) {
  try {
    const { domains } = await request.json()

    if (!domains || !Array.isArray(domains) || domains.length === 0) {
      return NextResponse.json({ error: "Invalid domains list" }, { status: 400 })
    }

    // Check if RapidAPI is configured
    if (!isRapidApiConfigured()) {
      return NextResponse.json(
        {
          error: "RapidAPI not configured",
          message: "Please configure RAPID_API_KEY environment variable",
        },
        { status: 500 },
      )
    }

    // Process domains one by one (RapidAPI endpoint accepts only one domain per request)
    const results = []

    for (const domain of domains) {
      try {
        // Clean domain (remove protocol, trailing slashes, etc.)
        const cleanDomain = domain
          .trim()
          .replace(/^https?:\/\//, "")
          .replace(/\/$/, "")

        // Call RapidAPI to get domain metrics
        const response = await fetch(`${RAPID_API_CONFIG.apiUrl}/?target=${encodeURIComponent(cleanDomain)}`, {
          method: "GET",
          headers: getRapidApiHeaders(),
        })

        if (!response.ok) {
          console.error(`RapidAPI error for ${domain}:`, response.status)

          results.push({
            domain,
            da: 0,
            pa: 0,
            spamScore: 0,
            backlinks: 0,
            status: "error",
            error: `API error: ${response.status}`,
          })

          continue
        }

        const data = await response.json()

        // Transform the response to our format
        results.push({
          domain,
          da: Number.parseInt(data.domain_authority) || 0,
          pa: Number.parseInt(data.page_authority) || 0,
          spamScore: 0, // Not provided by this API
          backlinks: Number.parseInt(data.external_backlinks) || 0,
          status: "success",
        })
      } catch (error) {
        console.error(`Error processing domain ${domain}:`, error)

        results.push({
          domain,
          da: 0,
          pa: 0,
          spamScore: 0,
          backlinks: 0,
          status: "error",
          error: error instanceof Error ? error.message : String(error),
        })
      }
    }

    return NextResponse.json({ results })
  } catch (error) {
    console.error("Request processing error:", error)
    return NextResponse.json({ error: "Invalid request" }, { status: 400 })
  }
}
