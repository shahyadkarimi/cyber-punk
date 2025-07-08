import { NextResponse, type NextRequest } from "next/server";
import User from "@/models/UsersModel";
import { getAuthUser } from "@/lib/auth";
import connectDB from "@/lib/connectDB";
import Domains from "@/models/DomainsModel";
import WatchList from "@/models/WatchListModel";
import Transactions from "@/models/TransactionsModel";

const formatDomain = (items: any) => {
  const formatted = items.map((item: any) => ({
    _id: item._id,
    id: item.id,
    domain: item.domain,
    description: item.description,
    price: item.price,
    status: item.status,
    seller: item.seller_id,
    admin_notes: item.admin_notes,
    da_score: item.da_score,
    pa_score: item.pa_score,
    traffic: item.traffic,
    category: item.category,
    tags: item.tags,
    approved_at: item.approved_at,
    approved_by: item.approved_by,
    sold_at: item.sold_at,
    created_at: item.created_at,
    deleted_at: item.deleted_at,
  }));

  return formatted;
};

export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const authUser = await getAuthUser(request);
    if (!authUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const domains = await Domains.find({
      seller_id: authUser.userId,
      deleted_at: null,
    })
      .populate("seller_id", "id username email")
      .populate("approved_by", "id username email")
      .sort({ created_at: -1 })
      .limit(6)
      .lean();

    const formattedDomains = formatDomain(domains);

    const recentlyDomains = await Domains.find({
      deleted_at: null,
      status: "approved",
    })
      .populate("seller_id", "id username email")
      .populate("approved_by", "id username email")
      .sort({ created_at: -1 })
      .limit(6)
      .lean();

    const recentlyDomainsFormatted = formatDomain(recentlyDomains);

    const [total_domains, pending_domains, approved_domains] =
      await Promise.all([
        Domains.countDocuments({
          deleted_at: null,
          seller_id: authUser.userId,
        }),
        Domains.countDocuments({
          status: "pending",
          deleted_at: null,
          seller_id: authUser.userId,
        }),
        Domains.countDocuments({
          status: "approved",
          deleted_at: null,
          seller_id: authUser.userId,
        }),
        Domains.countDocuments({
          status: "rejected",
          deleted_at: null,
          seller_id: authUser.userId,
        }),
      ]);

    const [available_domains] = await Promise.all([
      Domains.countDocuments({
        deleted_at: null,
        status: "approved",
      }),
    ]);

    const myPurchases = await Transactions.countDocuments({
      buyer_id: authUser.userId,
      status: "paid",
    });

    const watchlistCount = await WatchList.countDocuments({
      user: authUser.userId,
    });

    const sellerTransactions = await Transactions.find({
      seller_id: authUser.userId,
      status: "paid",
    })
      .select("-__v")
      .lean();

    const totalRevenue = sellerTransactions.reduce(
      (sum, tx) => sum + (tx.amount || 0),
      0
    );

    if (authUser.role === "seller") {
      return NextResponse.json(
        {
          domains: formattedDomains,
          total_domains,
          pending_domains,
          approved_domains,
          total_earnings: totalRevenue,
        },
        { status: 200 }
      );
    } else {
      return NextResponse.json(
        {
          domains: recentlyDomainsFormatted,
          available_domains,
          my_purchases: myPurchases,
          watchlist: watchlistCount,
          cart_items: 0,
        },
        { status: 200 }
      );
    }
  } catch (error: any) {
    console.error("Get user stats error:", error);
    return NextResponse.json(
      { error: "Failed to get user statistics" },
      { status: 500 }
    );
  }
}
