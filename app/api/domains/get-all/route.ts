import { NextResponse, type NextRequest } from "next/server";
import connectDB from "@/lib/connectDB";
import { getAuthUser } from "@/lib/auth";
import Domains from "@/models/DomainsModel";

export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const authUser = await getAuthUser(request);
    // if (!authUser) {
    //   return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    // }

    // if (authUser.role !== "admin") {
    //   return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    // }

    const { search, filter } = await request.json();

    const query: any = {};

    const andConditions = [];

    if (search) {
      const regex = new RegExp(search, "i");
      andConditions.push({
        $or: [
          { domain: regex },
          // { description: regex },
          // { category: regex },
        ],
      });
    }

    if (filter) {
      const regex = new RegExp(filter, "i");
      andConditions.push({ status: regex });
    }

    if (andConditions.length > 0) {
      query.$and = andConditions;
    }

    const domains = await Domains.find({
      ...query,
      deleted_at: null,
      status: { $in: ["approved",  "sold"] },
    })
      .populate("seller_id", "id username email")
      .populate("approved_by", "id username email")
      .sort({ created_at: -1 })
      .lean();

    const total = await Domains.countDocuments({ deleted_at: null })

    const formattedDomains = domains.map((item) => ({
      _id: item._id,
      id: item.id,
      domain: item.domain,
      description: item.description,
      price: item.price,
      status: item.status,
      seller: item.seller_id,
      da_score: item.da_score,
      pa_score: item.pa_score,
      traffic: item.traffic,
      category: item.category,
      tags: item.tags,
      sold_at: item.sold_at,
      created_at: item.created_at,
      deleted_at: item.deleted_at,
    }));

    return NextResponse.json(
      {
        domains: formattedDomains,
        stats: { total, total_revenue: 0 },
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Get domains error:", error);
    return NextResponse.json(
      { error: "Failed to fetch domains" },
      { status: 500 }
    );
  }
}
