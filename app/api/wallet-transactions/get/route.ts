import { NextRequest, NextResponse } from "next/server";
import { OxapayService } from "@/lib/payment-services/oxapay-service";
import WalletTransactions from "@/models/WalletTransactionsModel";
import { getAuthUser } from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    const authUser = await getAuthUser(request);

    if (!authUser) {
      return NextResponse.json(
        { error: "Unauthorized. Please sign in." },
        { status: 401 }
      );
    }

    const data = await request.json();

    const transaction = await WalletTransactions.findOne({
      order_id: data.orderId,
      user_id: authUser.userId,
    });

    if (!transaction) {
      return NextResponse.json(
        { success: false, message: "Transaction not found" },
        { status: 404 }
      );
    }

    // Return success
    return NextResponse.json({
      success: true,
      message: "Transaction found successfully",
      transaction,
    });
  } catch (error) {
    console.error("Faild to get transaction:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
