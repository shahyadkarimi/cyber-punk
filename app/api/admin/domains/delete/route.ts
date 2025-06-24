import { NextResponse, type NextRequest } from "next/server";
import { getAuthUser } from "@/lib/auth";
import connectDB from "@/lib/connectDB";
import Domains from "@/models/DomainsModel";

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
    const { id } = body;

    if (!id) {
      return NextResponse.json(
        { error: "Domain ID is required" },
        { status: 400 }
      );
    }

    const domain = await Domains.findById(id);
    if (!domain) {
      return NextResponse.json({ error: "Domain not found" }, { status: 404 });
    }

    domain.deleted_at = new Date();
    await domain.save();

    return NextResponse.json({ success: "Domain deleted" }, { status: 200 });
  } catch (error: any) {
    console.error("Admin soft delete error:", error);
    return NextResponse.json(
      { error: "Failed to soft delete domain" },
      { status: 500 }
    );
  }
}
