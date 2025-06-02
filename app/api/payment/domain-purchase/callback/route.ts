import { NextResponse } from "next/server"
import { OxapayService } from "@/lib/payment-services/oxapay-service"
import { DomainsService } from "@/lib/database-services/domains-service"

export async function POST(request: Request) {
  try {
    const data = await request.json()
    console.log("Domain purchase callback received:", data)

    // Verify the callback data
    if (!OxapayService.verifyCallback(data)) {
      console.error("Invalid callback data")
      return NextResponse.json({ success: false, message: "Invalid callback data" }, { status: 400 })
    }

    // Check payment status with Oxapay
    const paymentStatus = await OxapayService.checkPaymentStatus(data.track_id)
    console.log("Payment status:", paymentStatus)

    if (paymentStatus.status === "paid" && paymentStatus.orderId) {
      // Extract domain ID and user ID from the order ID
      // Format: domain-{domainId}-{userId}-{timestamp}
      const orderIdParts = paymentStatus.orderId.split("-")

      if (orderIdParts[0] === "domain" && orderIdParts.length >= 4) {
        const domainId = orderIdParts[1]
        const userId = orderIdParts[2]

        if (domainId && userId) {
          try {
            // Update domain status and buyer
            await DomainsService.purchaseDomain(domainId, userId)
            console.log(`Domain ${domainId} purchased by user ${userId}`)

            // Return success
            return NextResponse.json({ success: true, message: "Domain purchased successfully" })
          } catch (error) {
            console.error("Error updating domain:", error)
            return NextResponse.json({ success: false, message: "Failed to update domain" }, { status: 500 })
          }
        }
      }
    }

    return NextResponse.json({ success: false, message: "Payment not completed or invalid order" }, { status: 400 })
  } catch (error) {
    console.error("Domain purchase callback error:", error)
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 })
  }
}
