import { NextRequest, NextResponse } from "next/server";
import Domains from "@/models/DomainsModel";
import connectDB from "@/lib/connectDB";
import { getAuthUser } from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    await connectDB();
    const authUser = await getAuthUser(request);

    if (!authUser || authUser.role !== "seller") {
      return NextResponse.json(
        { error: "Unauthorized. Only sellers can view their domains." },
        { status: 403 }
      );
    }

    const sellerDomains = await Domains.find({
      seller_id: authUser.userId,
      deleted_at: null,
    })
      .sort({ created_at: -1 })
      .select("_id domain price status created_at description category tags");

    const formatted = sellerDomains.map((d) => ({
      id: d._id.toString(),
      domain: d.domain,
      price: d.price,
      status: d.status,
      created_at: d.created_at.toISOString(),
      description: d.description ?? undefined,
      category: d.category ?? undefined,
      tags: d.tags ?? [],
    }));

    return NextResponse.json({ domains: formatted }, { status: 200 });
  } catch (error) {
    console.error("Error fetching seller domains:", error);
    return NextResponse.json(
      { error: "Failed to fetch domains. Please try again later." },
      { status: 500 }
    );
  }
}
