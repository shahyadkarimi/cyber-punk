interface CreatePaymentParams {
  amount: number
  currency: string
  callbackUrl: string
  returnUrl: string
  description: string
  orderId: string
  email: string
  lifetime?: number
  feePaidByPayer?: number
  underPaidCoverage?: number
  toCurrency?: string
  autoWithdrawal?: boolean
  mixedPayment?: boolean
  thanksMessage?: string
  sandbox?: boolean
}

interface PaymentResponse {
  success: boolean
  paymentUrl?: string
  paymentId?: string
  trackId?: string
  error?: string
  details?: any
}

export class OxapayService {
  private static readonly API_URL = "https://api.oxapay.com/v1/payment/invoice"
  private static readonly MERCHANT_API_KEY = "HD7HN2-WV19M9-HVSGK1-M8YE19"

  // Check if we're in development/preview mode
  private static readonly IS_DEVELOPMENT =
    typeof window !== "undefined" &&
    (window.location.hostname === "localhost" ||
      window.location.hostname.includes("vercel.app") ||
      window.location.hostname.includes("preview"))

  static async createPayment(params: CreatePaymentParams): Promise<PaymentResponse> {
    try {
      console.log("Creating payment with params:", {
        ...params,
        email: params.email ? params.email.substring(0, 3) + "***" : undefined,
      })

      // In development/preview mode, return a mock successful response
      if (this.IS_DEVELOPMENT) {
        console.log("DEVELOPMENT MODE: Returning mock payment response")
        return {
          success: true,
          paymentUrl: "https://example.com/mock-payment",
          paymentId: "mock-payment-id-" + Date.now(),
          trackId: "mock-track-id-" + Date.now(),
        }
      }

      // Validate required parameters
      if (!params.amount || params.amount <= 0) {
        throw new Error("Amount must be greater than 0")
      }

      if (!params.email || !params.email.includes("@")) {
        throw new Error("Valid email is required")
      }

      if (!params.orderId || params.orderId.length < 3) {
        throw new Error("Order ID must be at least 3 characters")
      }

      if (!params.callbackUrl || !params.returnUrl) {
        throw new Error("Callback URL and Return URL are required")
      }

      // Prepare request data with exact format expected by Oxapay
      const requestData = {
        amount: Number(params.amount.toFixed(2)), // Ensure 2 decimal places
        currency: params.currency.toUpperCase(),
        lifetime: params.lifetime || 30,
        fee_paid_by_payer: params.feePaidByPayer || 1,
        under_paid_coverage: params.underPaidCoverage || 2.5,
        to_currency: params.toCurrency || "USDT",
        auto_withdrawal: params.autoWithdrawal || false,
        mixed_payment: params.mixedPayment !== false, // Default to true
        callback_url: params.callbackUrl,
        return_url: params.returnUrl,
        email: params.email.trim(),
        order_id: params.orderId.trim(),
        thanks_message: params.thanksMessage || "Thank you for your payment!",
        description: params.description || `Payment for order ${params.orderId}`,
        sandbox: params.sandbox || false,
      }

      const headers = {
        merchant_api_key: this.MERCHANT_API_KEY,
        "Content-Type": "application/json",
        Accept: "application/json",
      }

      console.log("Sending request to Oxapay:", {
        url: this.API_URL,
        headers: { ...headers, merchant_api_key: "***" },
        data: {
          ...requestData,
          email: requestData.email.replace(/(.{2}).*(@.*)/, "$1***$2"),
        },
      })

      const response = await fetch(this.API_URL, {
        method: "POST",
        headers,
        body: JSON.stringify(requestData),
      })

      let responseData: any
      const responseText = await response.text()

      try {
        responseData = JSON.parse(responseText)
      } catch (parseError) {
        console.error("Failed to parse Oxapay response:", responseText)
        throw new Error("Invalid response format from payment gateway")
      }

      console.log("Oxapay response:", {
        status: response.status,
        statusText: response.statusText,
        data: responseData,
      })

      // Handle different response scenarios
      if (!response.ok) {
        const errorMessage =
          responseData?.message || responseData?.error || `HTTP ${response.status}: ${response.statusText}`
        throw new Error(errorMessage)
      }

      // Check for successful response
      if (responseData.result === 100 && responseData.payment_url) {
        return {
          success: true,
          paymentUrl: responseData.payment_url,
          paymentId: responseData.payment_id,
          trackId: responseData.track_id,
        }
      }

      // Handle API errors
      if (responseData.result !== 100) {
        const errorMessage = responseData.message || `API Error: Result code ${responseData.result}`
        throw new Error(errorMessage)
      }

      // Fallback error
      throw new Error("Invalid response from payment gateway")
    } catch (error) {
      console.error("Error creating Oxapay payment:", error)

      let errorMessage = "Unknown error occurred"
      if (error instanceof Error) {
        errorMessage = error.message
      }

      // Provide more specific error messages
      if (errorMessage.includes("fetch")) {
        errorMessage = "Network error. Please check your internet connection and try again."
      } else if (errorMessage.includes("parse")) {
        errorMessage = "Invalid response from payment gateway. Please try again."
      } else if (errorMessage.includes("data provided")) {
        errorMessage = "Invalid payment data. Please check your input and try again."
      }

      return {
        success: false,
        error: errorMessage,
        details: error instanceof Error ? error.message : String(error),
      }
    }
  }

  static async checkPaymentStatus(trackId: string): Promise<{ status: string; orderId?: string; amount?: number }> {
    try {
      // In development/preview mode, return a mock successful response
      if (this.IS_DEVELOPMENT) {
        console.log("DEVELOPMENT MODE: Returning mock payment status")
        return {
          status: "paid",
          orderId: trackId.includes("domain") ? trackId : "mock-order-id",
          amount: 100,
        }
      }

      if (!trackId) {
        throw new Error("Track ID is required")
      }

      const url = "https://api.oxapay.com/v1/payment/status"

      const requestData = {
        track_id: trackId.trim(),
      }

      const headers = {
        merchant_api_key: this.MERCHANT_API_KEY,
        "Content-Type": "application/json",
        Accept: "application/json",
      }

      console.log("Checking payment status for track_id:", trackId)

      const response = await fetch(url, {
        method: "POST",
        headers,
        body: JSON.stringify(requestData),
      })

      const responseText = await response.text()
      let data: any

      try {
        data = JSON.parse(responseText)
      } catch (parseError) {
        console.error("Failed to parse status response:", responseText)
        throw new Error("Invalid response format from payment gateway")
      }

      console.log("Payment status response:", data)

      if (!response.ok) {
        throw new Error(data.message || `HTTP ${response.status}: ${response.statusText}`)
      }

      return {
        status: data.status || "unknown",
        orderId: data.order_id,
        amount: data.amount ? Number(data.amount) : undefined,
      }
    } catch (error) {
      console.error("Error checking Oxapay payment status:", error)
      throw error
    }
  }

  // Method to verify webhook/callback
  static verifyCallback(callbackData: any): boolean {
    // In development/preview mode, always return true
    if (this.IS_DEVELOPMENT) {
      console.log("DEVELOPMENT MODE: Automatically verifying callback")
      return true
    }

    try {
      // Basic verification
      const hasRequiredFields = callbackData.track_id && callbackData.status && callbackData.order_id

      if (!hasRequiredFields) {
        console.error("Missing required callback fields:", {
          hasTrackId: !!callbackData.track_id,
          hasStatus: !!callbackData.status,
          hasOrderId: !!callbackData.order_id,
        })
        return false
      }

      return true
    } catch (error) {
      console.error("Error verifying callback:", error)
      return false
    }
  }

  // Test connection method
  static async testConnection(): Promise<{ success: boolean; error?: string }> {
    // In development/preview mode, always return success
    if (this.IS_DEVELOPMENT) {
      console.log("DEVELOPMENT MODE: Test connection successful")
      return { success: true }
    }

    try {
      // Create a minimal test request to validate API key and connection
      const testData = {
        amount: 1,
        currency: "USD",
        lifetime: 30,
        fee_paid_by_payer: 1,
        under_paid_coverage: 2.5,
        to_currency: "USDT",
        auto_withdrawal: false,
        mixed_payment: true,
        callback_url: "https://example.com/callback",
        return_url: "https://example.com/return",
        email: "test@example.com",
        order_id: `test-${Date.now()}`,
        description: "Connection test",
        sandbox: true, // Use sandbox for testing
      }

      const headers = {
        merchant_api_key: this.MERCHANT_API_KEY,
        "Content-Type": "application/json",
        Accept: "application/json",
      }

      const response = await fetch(this.API_URL, {
        method: "POST",
        headers,
        body: JSON.stringify(testData),
      })

      const responseText = await response.text()
      console.log("Test connection response:", responseText)

      return { success: response.ok }
    } catch (error) {
      console.error("Connection test failed:", error)
      return {
        success: false,
        error: error instanceof Error ? error.message : "Connection test failed",
      }
    }
  }
}
