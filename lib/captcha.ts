// Simple CAPTCHA generator for rate limiting

interface CaptchaChallenge {
  id: string
  question: string
  answer: string
  image?: string
  expiresAt: number
}

class CaptchaGenerator {
  private challenges: Map<string, CaptchaChallenge>
  private readonly expirationTime: number = 10 * 60 * 1000 // 10 minutes

  constructor() {
    this.challenges = new Map()

    // Clean up expired challenges every 5 minutes
    setInterval(() => this.cleanup(), 5 * 60 * 1000)
  }

  /**
   * Generate a new CAPTCHA challenge
   */
  generateChallenge(): CaptchaChallenge {
    const id = this.generateId()
    const { question, answer } = this.generateMathProblem()

    const challenge: CaptchaChallenge = {
      id,
      question,
      answer,
      expiresAt: Date.now() + this.expirationTime,
    }

    this.challenges.set(id, challenge)
    return challenge
  }

  /**
   * Verify a CAPTCHA answer
   */
  verifyCaptcha(id: string, answer: string): boolean {
    const challenge = this.challenges.get(id)

    // If challenge doesn't exist or has expired
    if (!challenge || Date.now() > challenge.expiresAt) {
      return false
    }

    // Check if the answer is correct
    const isCorrect = challenge.answer.toLowerCase() === answer.toLowerCase()

    // Remove the challenge after verification (one-time use)
    if (isCorrect) {
      this.challenges.delete(id)
    }

    return isCorrect
  }

  /**
   * Generate a unique ID for the CAPTCHA
   */
  private generateId(): string {
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
  }

  /**
   * Generate a simple math problem
   */
  private generateMathProblem(): { question: string; answer: string } {
    const operations = ["+", "-", "*"]
    const operation = operations[Math.floor(Math.random() * operations.length)]

    let num1, num2, answer

    switch (operation) {
      case "+":
        num1 = Math.floor(Math.random() * 20) + 1
        num2 = Math.floor(Math.random() * 20) + 1
        answer = (num1 + num2).toString()
        break
      case "-":
        num1 = Math.floor(Math.random() * 20) + 10
        num2 = Math.floor(Math.random() * num1) + 1
        answer = (num1 - num2).toString()
        break
      case "*":
        num1 = Math.floor(Math.random() * 10) + 1
        num2 = Math.floor(Math.random() * 10) + 1
        answer = (num1 * num2).toString()
        break
      default:
        num1 = Math.floor(Math.random() * 20) + 1
        num2 = Math.floor(Math.random() * 20) + 1
        answer = (num1 + num2).toString()
    }

    return {
      question: `What is ${num1} ${operation} ${num2}?`,
      answer,
    }
  }

  /**
   * Clean up expired challenges
   */
  private cleanup(): void {
    const now = Date.now()
    for (const [id, challenge] of this.challenges.entries()) {
      if (now > challenge.expiresAt) {
        this.challenges.delete(id)
      }
    }
  }
}

// Create a singleton instance
export const captchaGenerator = new CaptchaGenerator()
