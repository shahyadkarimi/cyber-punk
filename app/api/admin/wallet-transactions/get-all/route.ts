import { NextResponse, type NextRequest } from "next/server";
import connectDB from "@/lib/connectDB";
import { getAuthUser } from "@/lib/auth";
import WalletTransactions from "@/models/WalletTransactionsModel";

export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const authUser = await getAuthUser(request);
    if (!authUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (authUser.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { search, filter } = await request.json();

    const query: any = {};
    const andConditions = [];

    if (search) {
      const regex = new RegExp(search, "i");
      andConditions.push({
        $or: [
          { order_id: regex },
          { track_id: regex },
          { transaction_hash: regex },
          { wallet_address: regex },
        ],
      });
    }

    if (filter) {
      if (filter.status) {
        andConditions.push({ status: new RegExp(filter.status, "i") });
      }
      if (filter.payment_method) {
        andConditions.push({
          payment_method: new RegExp(filter.payment_method, "i"),
        });
      }
      if (filter.currency) {
        andConditions.push({ currency: new RegExp(filter.currency, "i") });
      }
      if (filter.network) {
        andConditions.push({ network: new RegExp(filter.network, "i") });
      }
    }

    if (andConditions.length > 0) {
      query.$and = andConditions;
    }

    const transactions = await WalletTransactions.find(query)
      .populate("user_id", "id username email")
      .sort({ created_at: -1 })
      .lean();

    const total = await WalletTransactions.countDocuments({ status: "paid" });

    return NextResponse.json(
      {
        transactions: transactions.map((tx) => ({
          id: tx._id,
          user: tx.user_id,
          amount: tx.amount,
          status: tx.status,
          order_id: tx.order_id,
          track_id: tx.track_id,
          payment_method: tx.payment_method,
          transaction_hash: tx.transaction_hash,
          currency: tx.currency,
          network: tx.network,
          wallet_address: tx.wallet_address,
          completed_at: tx.completed_at,
          created_at: tx.created_at,
        })),

        total,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Get transactions error:", error);
    return NextResponse.json(
      { error: "Failed to fetch transactions" },
      { status: 500 }
    );
  }
}
