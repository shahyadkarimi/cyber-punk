// app/api/wallet/balance/route.ts
import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/connectDB";
import { getAuthUser } from "@/lib/auth";
import User from "@/models/UsersModel";

export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const authUser = await getAuthUser(request);

    if (!authUser) {
      return NextResponse.json(
        { error: "Unauthorized. Please sign in." },
        { status: 401 }
      );
    }

    const user = await User.findById(authUser.userId).select("balance");

    if (!user) {
      return NextResponse.json({ error: "User not found." }, { status: 404 });
    }

    return NextResponse.json({ balance: user.balance }, { status: 200 });
  } catch (error) {
    console.error("Get wallet balance error:", error);
    return NextResponse.json(
      { error: "An error occurred while fetching wallet balance." },
      { status: 500 }
    );
  }
}
