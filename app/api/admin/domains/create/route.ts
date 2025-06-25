import { NextRequest, NextResponse } from "next/server";
import Domains from "@/models/DomainsModel";
import { createDomain, editDomainAdmin } from "@/lib/validation";
import connectDB from "@/lib/connectDB";
import { getAuthUser } from "@/lib/auth";

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

    const body = await request.json();

    const domainData = editDomainAdmin
      .partial({ id: true, seller_id: true })
      .safeParse(body);

    if (!domainData.success) {
      const errorMessages = domainData.error.errors.map((e) => e.message);
      return NextResponse.json({ error: errorMessages[0] }, { status: 400 });
    }

    const {
      domain,
      price,
      description,
      category,
      tags,
      status,
      seller_id,
      admin_notes,
      da_score,
      pa_score,
      traffic,
    } = domainData.data;

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
      seller_id,
      status,
      admin_notes,
      da_score,
      pa_score,
      traffic,
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
