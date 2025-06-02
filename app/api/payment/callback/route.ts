import { NextResponse } from "next/server"
import { UsersService } from "@/lib/database-services/users-service"
import { OxapayService } from "@/lib/payment-services/oxapay-service"

export async function POST(request: Request) {
  try {
    const data = await request.json()
    console.log("Payment callback received:", data)

    // Verify the callback data
    if (!OxapayService.verifyCallback(data)) {
      console.error("Invalid callback data")
      return NextResponse.json({ success: false, message: "Invalid callback data" }, { status: 400 })
    }

    // Check payment status with Oxapay
    const paymentStatus = await OxapayService.checkPaymentStatus(data.track_id)
    console.log("Payment status:", paymentStatus)

    if (paymentStatus.status === "paid" && paymentStatus.orderId) {
      // Extract user ID and amount from the order ID
      // Format: wallet-{userId}-{timestamp}
      const orderIdParts = paymentStatus.orderId.split("-")

      if (orderIdParts[0] === "wallet" && orderIdParts.length >= 3) {
        const userId = orderIdParts[1]
        const amount = paymentStatus.amount || Number.parseFloat(data.amount)

        if (userId && !isNaN(amount)) {
          try {
            // Add balance to user
            const newBalance = await UsersService.addUserBalance(userId, amount)
            console.log(`Added ${amount} to user ${userId}, new balance: ${newBalance}`)

            // Return success
            return NextResponse.json({ success: true, message: "Balance updated successfully" })
          } catch (error) {
            console.error("Error updating user balance:", error)
            return NextResponse.json({ success: false, message: "Failed to update balance" }, { status: 500 })
          }
        }
      }
    }

    return NextResponse.json({ success: false, message: "Payment not completed or invalid order" }, { status: 400 })
  } catch (error) {
    console.error("Payment callback error:", error)
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 })
  }
}
