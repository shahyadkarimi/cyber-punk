import { NextResponse, type NextRequest } from "next/server";
import User from "@/models/UsersModel";
import { getAuthUser } from "@/lib/auth";
import connectDB from "@/lib/connectDB";

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

    const query: any = {
      role: { $in: ["client", "seller"] },
      deleted_at: null,
    };

    if (search) {
      const regex = new RegExp(search, "i"); // case-insensitive search
      query.$or = [{ full_name: regex }, { username: regex }, { email: regex }];
    }

    const users = await User.find(query).select(
      "-password -reset_token -reset_token_expires"
    );

    return NextResponse.json({ users }, { status: 200 });
  } catch (error: any) {
    console.error("Get users error:", error);
    return NextResponse.json(
      { error: "Failed to fetch users" },
      { status: 500 }
    );
  }
}
