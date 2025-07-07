import { NextRequest, NextResponse } from "next/server";
import { OxapayService } from "@/lib/payment-services/oxapay-service";
import Domains from "@/models/DomainsModel";
import Transactions from "@/models/TransactionsModel";
import { DomainWithSeller } from "@/lib/database-services/domains-service";

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    console.log("Domain purchase callback received:", data);
    // Verify the callback data
    if (!OxapayService.verifyCallback(data)) {
      console.error("Invalid callback data");
      return NextResponse.json(
        { success: false, message: "Invalid callback data" },
        { status: 400 }
      );
    }

    // Check payment status with Oxapay
    const paymentData = await OxapayService.checkPaymentStatus(data.track_id);
    console.log("Payment status:", paymentData);

    if (paymentData.status === "paid" && paymentData.orderId) {
      // Extract domain ID and user ID from the order ID
      // Format: domain-{domainId}-{userId}-{timestamp}
      const orderIdParts = paymentData.orderId.split("-");

      if (orderIdParts[0] === "domain" && orderIdParts.length >= 4) {
        const domainId = orderIdParts[1];
        const userId = orderIdParts[2];

        if (domainId && userId) {
          try {
            // Update domain status and buyer
            console.log(`Domain ${domainId} purchased by user ${userId}`);

            const domain: DomainWithSeller | null = await Domains.findOne({
              id: domainId,
            });

            if (!domain) {
              return NextResponse.json(
                { success: false, message: "Domain not found" },
                { status: 404 }
              );
            }

            const transaction = new Transactions({
              order_id: paymentData.orderId,
              track_id: paymentData.trackId,
              domain_id: domainId,
              seller_id: domain.seller_id,
              buyer_id: userId,
              amount: paymentData.amount,
              status: paymentData.status,
              payment_method: "oxapay",
              transaction_hash: paymentData.transaction_hash,
              currency: paymentData.currency,
              network: paymentData.network,
              wallet_address: paymentData.wallet_address,
              completed_at: new Date(),
              created_at: new Date(paymentData.created_at * 1000),
            });

            await transaction.save();

            // Return success
            return NextResponse.json({
              success: true,
              message: "Domain purchased successfully",
            });
          } catch (error) {
            console.error("Error updating domain:", error);
            return NextResponse.json(
              { success: false, message: "Failed to update domain" },
              { status: 500 }
            );
          }
        }
      }
    }

    return NextResponse.json(
      { success: false, message: "Payment not completed or invalid order" },
      { status: 400 }
    );
  } catch (error) {
    console.error("Domain purchase callback error:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
