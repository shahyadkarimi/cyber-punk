import type { ScanResult } from "./vulnerability-scanner"
import { verifyCaptcha } from "./domain-finder"

/**
 * Scan a website for vulnerabilities
 */
export async function scanWebsiteForVulnerabilities(url: string, selectedCms?: string): Promise<ScanResult> {
  try {
    const response = await fetch("/api/vuln-scanner", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ url, selectedCms }),
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

    return await response.json()
  } catch (error) {
    console.error("Error in scanWebsiteForVulnerabilities:", error)
    throw error
  }
}

/**
 * Verify a CAPTCHA for the vulnerability scanner
 */
export async function verifyVulnScannerCaptcha(captchaId: string, captchaAnswer: string): Promise<boolean> {
  return await verifyCaptcha(captchaId, captchaAnswer)
}
