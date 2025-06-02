// Enhanced rate limiter with CAPTCHA support

interface RateLimitRecord {
  count: number
  resetAt: number
  captchaRequired: boolean
  captchaVerified: boolean
}

class RateLimiter {
  private records: Map<string, RateLimitRecord>
  private readonly limit: number
  private readonly windowMs: number
  private readonly captchaThreshold: number

  constructor(limit = 10, windowMs = 60000, captchaThreshold = 15) {
    this.records = new Map()
    this.limit = limit
    this.windowMs = windowMs
    this.captchaThreshold = captchaThreshold

    // Clean up expired records every minute
    setInterval(() => this.cleanup(), 60000)
  }

  /**
   * Check if a key has exceeded the rate limit
   */
  isRateLimited(key: string): boolean {
    const now = Date.now()
    const record = this.records.get(key)

    // If no record exists or the window has expired, create a new record
    if (!record || now > record.resetAt) {
      this.records.set(key, {
        count: 1,
        resetAt: now + this.windowMs,
        captchaRequired: false,
        captchaVerified: false,
      })
      return false
    }

    // If CAPTCHA is required but not verified, rate limit
    if (record.captchaRequired && !record.captchaVerified) {
      return true
    }

    // Increment the count
    record.count++

    // Check if CAPTCHA should be required
    if (record.count > this.captchaThreshold) {
      record.captchaRequired = true
    }

    // Check if the limit has been exceeded
    if (record.count > this.limit && !record.captchaVerified) {
      return true
    }

    return false
  }

  /**
   * Mark a key as having verified a CAPTCHA
   */
  setCaptchaVerified(key: string): void {
    const record = this.records.get(key)
    if (record) {
      record.captchaVerified = true
      // Reset the count to allow more requests
      record.count = Math.floor(this.limit / 2)
    }
  }

  /**
   * Check if a key requires CAPTCHA verification
   */
  requiresCaptcha(key: string): boolean {
    const record = this.records.get(key)
    return record ? record.captchaRequired && !record.captchaVerified : false
  }

  /**
   * Get remaining requests for a key
   */
  getRemainingRequests(key: string): number {
    const record = this.records.get(key)
    if (!record) {
      return this.limit
    }

    return Math.max(0, this.limit - record.count)
  }

  /**
   * Get reset time for a key
   */
  getResetTime(key: string): number {
    const record = this.records.get(key)
    if (!record) {
      return Date.now() + this.windowMs
    }

    return record.resetAt
  }

  /**
   * Clean up expired records
   */
  private cleanup(): void {
    const now = Date.now()
    for (const [key, record] of this.records.entries()) {
      if (now > record.resetAt) {
        this.records.delete(key)
      }
    }
  }
}

// Create a singleton instance
export const rateLimiter = new RateLimiter()
