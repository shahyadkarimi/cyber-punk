import { NextRequest, NextResponse } from "next/server";
import WalletTransactions from "@/models/WalletTransactionsModel";
import { getAuthUser } from "@/lib/auth";
import Domains from "@/models/DomainsModel";

export async function POST(request: NextRequest) {
  try {
    const authUser = await getAuthUser(request);

    if (!authUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (authUser.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const data = await request.json();

    const transaction: any = await WalletTransactions.findOne({
      track_id: data.trackId,
    })
      .select("-__v")
      .populate("user_id", "id username email")
      .lean();

    if (!transaction) {
      return NextResponse.json(
        { success: false, error: "Transaction not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Transaction found successfully",
      transaction: { ...transaction },
    });
  } catch (error) {
    console.error("Failed to get transaction:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
