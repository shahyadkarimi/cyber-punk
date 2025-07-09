import { NextResponse, type NextRequest } from "next/server";
import connectDB from "@/lib/connectDB";
import { getAuthUser } from "@/lib/auth";
import Domains from "@/models/DomainsModel";
import WatchList from "@/models/WatchListModel";
import { verifyToken } from "@/lib/jwt";

interface DomainType {
  _id: string;
  id: number;
  domain: string;
  description?: string;
  price?: number;
  status: string;
  seller_id?: {
    id: string;
    username: string;
    email: string;
  };
  buyer_id?: string;
  da_score?: number;
  pa_score?: number;
  traffic?: number;
  category?: string;
  tags?: string[];
  sold_at?: Date;
  created_at?: Date;
  deleted_at?: Date;
}

export async function GET(
  request: NextRequest,
  context: { params: { id: string } }
) {
  try {
    await connectDB();

    const { id } = context.params;

    const token = request.headers.get("x-auth-token");

    const authUser = verifyToken(token);

    const domain = await Domains.findOne({
      id: id,
      deleted_at: null,
    })
      .populate("seller_id", "id username email created_at admin_approved")
      .populate("approved_by", "id username email")
      .lean<DomainType>();

    if (!domain) {
      return NextResponse.json({ error: "Domain not found" }, { status: 404 });
    }

    const watchlistCount = await WatchList.countDocuments({
      domain: domain.id,
    });

    const isInWatchList = await WatchList.findOne({
      user: authUser?.userId,
      domain: domain.id,
    });

    const formattedDomain = {
      _id: domain._id,
      id: domain.id,
      domain: domain.domain,
      description: domain.description,
      price: domain.price,
      status: domain.status,
      seller: domain.seller_id,
      watchlist_count: watchlistCount,
      da_score: domain.da_score,
      pa_score: domain.pa_score,
      traffic: domain.traffic,
      category: domain.category,
      is_in_watchlist: Boolean(isInWatchList),
      tags: domain.tags,
      sold_at: domain.sold_at,
      created_at: domain.created_at,
    };

    return NextResponse.json({ ...formattedDomain }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch domain" },
      { status: 500 }
    );
  }
}
