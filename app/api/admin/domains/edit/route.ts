import { getAuthUser } from "@/lib/auth";
import connectDB from "@/lib/connectDB";
import { domainAdmin } from "@/lib/validation";
import Domains from "@/models/DomainsModel";
import { NextRequest, NextResponse } from "next/server";

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
    const DomainData = domainAdmin.safeParse(body);
    // const DomainData = body;

    if (!DomainData.success) {
      const message = DomainData.error.errors[0]?.message || "Invalid input.";
      return NextResponse.json({ error: message }, { status: 400 });
    }

    const {
      id,
      domain,
      price,
      description,
      category,
      country,
      tags,
      status,
      seller_id,
      admin_notes,
      da_score,
      pa_score,
      traffic,
      premium,
    } = DomainData.data;

    const userDomain = await Domains.findById(id);

    const existingDomain = await Domains.findOne({
      domain: userDomain.domain,
      _id: { $ne: id },
    });

    if (existingDomain) {
      return Response.json(
        { error: "This domain has already been registered." },
        { status: 400 }
      );
    }

    if (!userDomain) {
      return NextResponse.json({ error: "Domain not found." }, { status: 404 });
    }

    const editedDomain = await Domains.findByIdAndUpdate(
      id,
      {
        domain,
        price,
        description,
        category,
        country,
        tags,
        status,
        seller_id,
        admin_notes,
        da_score,
        pa_score,
        traffic,
        premium,
        updated_at: new Date(),
      },
      {
        new: true,
        select: "_id domain price status created_at description category tags",
      }
    );

    return NextResponse.json(
      { message: "Domain updated successfully.", domain: editedDomain },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error updating domain:", error);
    return NextResponse.json(
      { error: "Failed to update domain. Please try again later." },
      { status: 500 }
    );
  }
}
