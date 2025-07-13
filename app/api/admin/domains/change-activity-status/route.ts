import { NextResponse, type NextRequest } from "next/server";
import Domains from "@/models/DomainsModel";
import { getAuthUser } from "@/lib/auth";
import connectDB from "@/lib/connectDB";

export async function POST(request: NextRequest) {
  try {
    await connectDB();

    // const authUser = await getAuthUser(request);
    // if (!authUser) {
    //   return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    // }

    // if (authUser.role !== "admin") {
    //   return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    // }

    const body = await request.json();
    const { domain, status } = body;

    if (!domain) {
      return NextResponse.json(
        { error: "Domain is required" },
        { status: 400 }
      );
    }

    const domainData = await Domains.findOne({ domain });
    if (!domainData) {
      return NextResponse.json({ error: "Domain not found" }, { status: 404 });
    }

    domainData.activity_status = status;
    await domainData.save();

    return NextResponse.json(
      { suceess: `Domain activity status changed. ${domain} is ${status}` },
      { status: 200 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { error: "Failed to change domain status" },
      { status: 500 }
    );
  }
}
