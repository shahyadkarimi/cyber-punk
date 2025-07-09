import { NextRequest, NextResponse } from "next/server";
import Transactions from "@/models/TransactionsModel";
import { getAuthUser } from "@/lib/auth";
import Domains from "@/models/DomainsModel";

export async function POST(request: NextRequest) {
  try {
    const authUser = await getAuthUser(request);

    if (!authUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const data = await request.json();

    const transaction: any = await Transactions.findOne({
      track_id: data.trackId,
    })
      .select("-__v")
      .populate("seller_id", "id username email")
      .populate("buyer_id", "id username email")
      .lean();

    if (!transaction) {
      return NextResponse.json(
        { success: false, error: "Transaction not found" },
        { status: 404 }
      );
    }

    // اجازه فقط به admin یا seller مربوطه
    if (
      authUser.role !== "admin" &&
      !(
        authUser.role === "seller" &&
        transaction.seller_id.id === authUser.userId
      )
    ) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
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

    return NextResponse.json({
      success: true,
      message: "Transaction found successfully",
      transaction: { ...transaction, domain },
    });
  } catch (error) {
    console.error("Failed to get transaction:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
