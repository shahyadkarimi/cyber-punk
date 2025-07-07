import { NextRequest, NextResponse } from "next/server";
import { OxapayService } from "@/lib/payment-services/oxapay-service";
import WalletTransactions from "@/models/WalletTransactionsModel";
import { getAuthUser } from "@/lib/auth";
import User from "@/models/UsersModel";

export async function POST(request: NextRequest) {
  try {
    // const authUser = await getAuthUser(request);

    // if (!authUser) {
    //   return NextResponse.json(
    //     { error: "Unauthorized. Please sign in." },
    //     { status: 401 }
    //   );
    // }

    const data = await request.json();
    console.log("Payment callback received:", data);

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
      // Extract user ID and amount from the order ID
      // Format: wallet-{userId}-{timestamp}
      const orderIdParts = paymentData.orderId.split("-");

      if (orderIdParts[0] === "wallet" && orderIdParts.length >= 3) {
        const userId = orderIdParts[1];
        const amount = paymentData.amount || Number.parseFloat(data.amount);

        if (userId && !isNaN(amount)) {
          try {
            // Add balance to user
            const user = await User.findById(userId);

            if (!user) {
              return NextResponse.json(
                { error: "User not found" },
                { status: 404 }
              );
            }

            const transactionPaid = await WalletTransactions.findOne({
              order_id: paymentData.orderId,
            });

            if (transactionPaid.status !== "paid") {
              user.balance = (user.balance || 0) + amount;
              await user.save();

              // update transaction
              const transaction = await WalletTransactions.findOneAndUpdate(
                {
                  order_id: paymentData.orderId,
                },
                {
                  $set: {
                    track_id: paymentData.trackId,
                    order_id: paymentData.orderId,
                    user_id: userId,
                    amount: paymentData.amount,
                    status: paymentData.status,
                    transaction_hash: paymentData.transaction_hash,
                    currency: paymentData.currency,
                    network: paymentData.network,
                    wallet_address: paymentData.wallet_address,
                    completed_at: new Date(),
                  },
                },
                { new: true }
              );

              return NextResponse.json({
                success: true,
                message: "Balance updated successfully",
                new_balance: user.balance,
                transaction,
              });
            } else {
              return NextResponse.json(
                {
                  success: false,
                  message: "Failed to pay invoice because already paid",
                },
                { status: 400 }
              );
            }

            // Return success
          } catch (error) {
            console.error("Error updating user balance:", error);
            return NextResponse.json(
              { success: false, message: "Failed to update balance" },
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
    console.error("Payment callback error:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
