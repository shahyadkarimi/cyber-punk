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

    const [total, admins, active, inactive] = await Promise.all([
      User.countDocuments({ deleted_at: null }),
      User.countDocuments({ role: "admin", deleted_at: null }),
      User.countDocuments({ is_active: true, deleted_at: null }),
      User.countDocuments({ is_active: false, deleted_at: null }),
    ]);

    return NextResponse.json(
      {
        total,
        admins,
        active,
        inactive,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Get user stats error:", error);
    return NextResponse.json(
      { error: "Failed to get user statistics" },
      { status: 500 }
    );
  }
}
