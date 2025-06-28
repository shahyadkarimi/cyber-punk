import { NextResponse, type NextRequest } from "next/server";
import connectDB from "@/lib/connectDB";
import { getAuthUser } from "@/lib/auth";
import Domains from "@/models/DomainsModel";
import { DomainWithSeller } from "@/lib/database-services/domains-service";

interface DomainType {
  _id: string;
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

    // Optional: احراز هویت
    // const authUser = await getAuthUser(request);
    // if (!authUser) {
    //   return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    // }

    const domain = await Domains.findOne({
      _id: id,
      deleted_at: null,
    })
      .populate("seller_id", "id username email")
      .populate("approved_by", "id username email")
      .lean<DomainType>();

    if (!domain) {
      return NextResponse.json({ error: "Domain not found" }, { status: 404 });
    }

    const formattedDomain = {
      id: domain._id,
      domain: domain.domain,
      description: domain.description,
      price: domain.price,
      status: domain.status,
      seller: domain.seller_id,
      //   buyer_id: domain.buyer_id,
      da_score: domain.da_score,
      pa_score: domain.pa_score,
      traffic: domain.traffic,
      category: domain.category,
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
