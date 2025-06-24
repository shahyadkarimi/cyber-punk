import { NextResponse, type NextRequest } from "next/server";
import Domains from "@/models/DomainsModel";
import { getAuthUser } from "@/lib/auth";
import connectDB from "@/lib/connectDB";

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
    const { id, status } = body;

    if (!id) {
      return NextResponse.json(
        { error: "Domain id is required" },
        { status: 400 }
      );
    }

    const domain = await Domains.findById(id);
    if (!domain) {
      return NextResponse.json({ error: "Domain not found" }, { status: 404 });
    }

    domain.status = status;
    await domain.save();

    return NextResponse.json(
      { suceess: "Domain status changed" },
      { status: 200 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { error: "Failed to toggle domain status" },
      { status: 500 }
    );
  }
}
