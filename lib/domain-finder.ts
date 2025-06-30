/**
 * Find domains sharing the same IP address
 */
export async function findDomainsByIp(url: string): Promise<string[]> {
  try {
    const response = await fetch("/api/domain-finder/sub-domains", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ url, action: "reverse" }),
    })

    if (!response.ok) {
      const errorData = await response.json()

      // Handle rate limit error with CAPTCHA
      if (response.status === 429) {
        if (errorData.captchaRequired) {
          throw {
            message: errorData.error || "Rate limit exceeded. Please complete the CAPTCHA to continue.",
            captchaRequired: true,
            captcha: errorData.captcha,
          }
        } else {
          throw {
            message: errorData.error || "Rate limit exceeded. Please try again later.",
            resetAt: errorData.resetAt,
          }
        }
      }

      throw new Error(errorData.error || `API returned ${response.status}`)
    }

    const data = await response.json()
    return data.domains || []
  } catch (error) {
    console.error("Error in findDomainsByIp:", error)
    throw error
  }
}

/**
 * Find subdomains for a given domain
 */
export async function findSubdomains(domain: string): Promise<string[]> {
  try {
    const response = await fetch("/api/domain-finder/sub-domains", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ url: domain, action: "subdomain" }),
    })

    if (!response.ok) {
      const errorData = await response.json()

      // Handle rate limit error with CAPTCHA
      if (response.status === 429) {
        if (errorData.captchaRequired) {
          throw {
            message: errorData.error || "Rate limit exceeded. Please complete the CAPTCHA to continue.",
            captchaRequired: true,
            captcha: errorData.captcha,
          }
        } else {
          throw {
            message: errorData.error || "Rate limit exceeded. Please try again later.",
            resetAt: errorData.resetAt,
          }
        }
      }

      throw new Error(errorData.error || `API returned ${response.status}`)
    }

    const data = await response.json()
    return data.subdomains || []
  } catch (error) {
    console.error("Error in findSubdomains:", error)
    throw error
  }
}

/**
 * Check the CMS for a given URL
 */
export async function checkCMS(url: string): Promise<{ cms: string; confidence: number; vulnerabilities?: string[] }> {
  try {
    const response = await fetch("/api/domain-finder/sub-domains", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ url, action: "cms", bypassRateLimit: true }),
    })

    if (!response.ok) {
      // Handle rate limit error with CAPTCHA
      if (response.status === 429) {
        const errorData = await response.json()

        if (errorData.captchaRequired) {
          throw {
            message: errorData.error || "Rate limit exceeded. Please complete the CAPTCHA to continue.",
            captchaRequired: true,
            captcha: errorData.captcha,
          }
        } else {
          throw {
            message: errorData.error || "Rate limit exceeded. Please try again later.",
            resetAt: errorData.resetAt,
          }
        }
      }

      return { cms: "Error Checking", confidence: 0 }
    }

    const data = await response.json()
    return {
      cms: data.cms || "Unknown",
      confidence: data.confidence || 0,
      vulnerabilities: data.vulnerabilities,
    }
  } catch (error) {
    console.error("Error in checkCMS:", error)
    // Return a default response instead of throwing the error
    return { cms: "Error Checking", confidence: 0 }
  }
}

/**
 * Verify a CAPTCHA
 */
export async function verifyCaptcha(captchaId: string, captchaAnswer: string): Promise<boolean> {
  try {
    const response = await fetch("/api/domain-finder/sub-domains", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        action: "verify_captcha",
        captchaId,
        captchaAnswer,
      }),
    })

    if (!response.ok) {
      return false
    }

    const data = await response.json()
    return data.success === true
  } catch (error) {
    console.error("Error in verifyCaptcha:", error)
    return false
  }
}

/**
 * Get a new CAPTCHA challenge
 */
export async function getCaptcha(): Promise<{ id: string; question: string; expiresAt: number } | null> {
  try {
    const response = await fetch("/api/domain-finder/sub-domains", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ action: "get_captcha" }),
    })

    if (!response.ok) {
      return null
    }

    return await response.json()
  } catch (error) {
    console.error("Error in getCaptcha:", error)
    return null
  }
}
