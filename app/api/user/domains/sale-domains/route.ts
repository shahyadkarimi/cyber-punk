import { NextRequest, NextResponse } from "next/server";
import Domains from "@/models/DomainsModel";
import connectDB from "@/lib/connectDB";
import { getAuthUser } from "@/lib/auth";
import Transactions from "@/models/TransactionsModel";

export async function GET(request: NextRequest) {
  try {
    await connectDB();
    const authUser = await getAuthUser(request);

    if (!authUser) {
      return NextResponse.json(
        {
          error: "Unauthorized. Only clients can view their purchases domains",
        },
        { status: 403 }
      );
    }

    const transactions = await Transactions.find({
      seller_id: authUser.userId,
      status: "paid",
    })
      .select("-__v")
      .lean();

    const transactionsWithDomain = await Promise.all(
      transactions.map(async (tx) => {
        const domain = await Domains.findOne({ id: tx.domain_id })
          .populate("buyer_id", "username email full_name")
          .select("-__v")
          .lean();
        return { ...tx, domain };
      })
    );

    const totalSales = transactions.length;
    const totalRevenue = transactions.reduce(
      (sum, tx) => sum + (tx.amount || 0),
      0
    );
    const averagePrice = totalSales > 0 ? totalRevenue / totalSales : 0;

    const conversionRate = null;

    return NextResponse.json({
      success: true,
      message: "Transactions found successfully",
      transactions: transactionsWithDomain,
      stats: {
        totalSales,
        totalRevenue,
        averagePrice,
        conversionRate,
      },
    });
  } catch (error) {
    console.error("Error fetching seller domains:", error);
    return NextResponse.json(
      { error: "Failed to fetch domains. Please try again later." },
      { status: 500 }
    );
  }
}
