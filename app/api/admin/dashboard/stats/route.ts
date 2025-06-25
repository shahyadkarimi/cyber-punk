import { NextResponse, type NextRequest } from "next/server";
import User from "@/models/UsersModel";
import { getAuthUser } from "@/lib/auth";
import connectDB from "@/lib/connectDB";
import Domains from "@/models/DomainsModel";

export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const authUser = await getAuthUser(request);
    if (!authUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (authUser.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const [total_users] = await Promise.all([
      User.countDocuments({ deleted_at: null }),
    ]);

    const domains = await Domains.find({ deleted_at: null })
      .populate("seller_id", "id username email")
      .populate("approved_by", "id username email")
      .sort({ created_at: -1 })
      .limit(10)
      .lean();

    const formattedDomains = domains.map((item) => ({
      id: item._id,
      domain: item.domain,
      description: item.description,
      price: item.price,
      status: item.status,
      seller: item.seller_id,
      buyer_id: item.buyer_id,
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

    const [total_domains, pending_domains] = await Promise.all([
      Domains.countDocuments({ deleted_at: null }),
      Domains.countDocuments({ status: "pending", deleted_at: null }),
      Domains.countDocuments({ status: "approved", deleted_at: null }),
      Domains.countDocuments({ status: "rejected", deleted_at: null }),
    ]);

    return NextResponse.json(
      {
        domains: formattedDomains,
        total_users,
        total_domains,
        pending_domains,
        total_revenue: 0,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Get user stats error:", error);
    return NextResponse.json(
      { error: "Failed to get user statistics" },
      { status: 500 }
    );
  }
}
