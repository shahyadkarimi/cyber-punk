import { NextRequest, NextResponse } from "next/server";
import Domains from "@/models/DomainsModel";
import { createDomain } from "@/lib/validation";
import connectDB from "@/lib/connectDB";
import { getAuthUser } from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const authUser = await getAuthUser(request);

    if (!authUser || authUser.role !== "seller") {
      return NextResponse.json(
        { error: "Unauthorized. Only sellers can submit domains.", authUser },
        { status: 403 }
      );
    }

    const body = await request.json();

    const parseResult = createDomain.safeParse(body);

    if (!parseResult.success) {
      const errorMessages = parseResult.error.errors.map((e) => e.message);
      return NextResponse.json(
        { error: errorMessages[0] }, // Only send first error for simplicity
        { status: 400 }
      );
    }

    const { domain, description, price, category, tags } = parseResult.data;

    const exists = await Domains.findOne({ domain: domain.trim() });
    
    if (exists) {
      return NextResponse.json(
        { error: "This domain has already been registered." },
        { status: 409 }
      );
    }

    const newDomain = await Domains.create({
      domain: domain.trim(),
      description,
      price,
      category,
      tags,
      seller_id: authUser.userId,
      status: "pending",
    });

    return NextResponse.json(
      { message: "Domain successfully submitted.", domain: newDomain },
      { status: 201 }
    );
  } catch (error) {
    console.error("Domain creation error:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred while submitting the domain." },
      { status: 500 }
    );
  }
}
