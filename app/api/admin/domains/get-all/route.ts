import { NextResponse, type NextRequest } from "next/server";
import connectDB from "@/lib/connectDB";
import { getAuthUser } from "@/lib/auth";
import Domains from "@/models/DomainsModel"; // مدل دامین
import User from "@/models/UsersModel"; // برای جمع‌کردن seller و approved_by_user اگر Populate خواستی

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

    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search");

    const query: any = {};

    if (search) {
      const regex = new RegExp(search, "i");
      query.$or = [
        { domain: regex },
        { description: regex },
        { category: regex },
        { tags: { $in: [regex] } },
      ];
    }

    const domains = await Domains.find({ ...query, deleted_at: null })
      .populate("seller_id", "id username email")
      .populate("approved_by", "id username email")
      .sort({ created_at: -1 })
      .lean();

    const formatted = domains.map((item) => ({
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

    return NextResponse.json({ domains: formatted }, { status: 200 });
  } catch (error: any) {
    console.error("Get domains error:", error);
    return NextResponse.json(
      { error: "Failed to fetch domains" },
      { status: 500 }
    );
  }
}
