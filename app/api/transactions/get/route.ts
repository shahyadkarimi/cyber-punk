import { NextRequest, NextResponse } from "next/server";
import Transactions from "@/models/TransactionsModel";
import { getAuthUser } from "@/lib/auth";
import Domains from "@/models/DomainsModel";

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

    const transaction: any = await Transactions.findOne({
      order_id: data.orderId,
      buyer_id: authUser.userId,
    })
      .select("-__v")
      .lean();

    if (!transaction) {
      return NextResponse.json(
        { success: false, error: "Transaction not found" },
        { status: 404 }
      );
    }

    const domain = await Domains.findOne({ id: transaction.domain_id }).select(
      "-__v"
    );

    if (!domain) {
      return NextResponse.json(
        { success: false, error: "Domain not found" },
        { status: 400 }
      );
    }

    // Return success
    return NextResponse.json({
      success: true,
      message: "Transaction found successfully",
      transaction: { ...transaction, domain },
    });
  } catch (error) {
    console.error("Faild to get transaction:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
