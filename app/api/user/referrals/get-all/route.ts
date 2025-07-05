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

    const user = await User.findById(authUser.userId);

    const referrals = await User.find({
      parent_referral: user.referral_code,
      is_active: true,
      deleted_at: null,
    }).select("username full_name avatar_url email role created_at");

    return NextResponse.json({ referrals }, { status: 200 });
  } catch (error: any) {
    console.error("Get referrals error:", error);
    return NextResponse.json(
      { error: "Failed to fetch referrals" },
      { status: 500 }
    );
  }
}
