import { NextResponse, type NextRequest } from "next/server";
import User from "@/models/UsersModel";
import { getAuthUser } from "@/lib/auth";
import connectDB from "@/lib/connectDB";
import { adminUpdateUser } from "@/lib/validation";

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
    const { userId, username, full_name, email, role } = body;

    // Validate input
    const validatedData = adminUpdateUser.parse(body);

    if (!userId) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 }
      );
    }

    // Check username uniqueness if provided
    if (validatedData.username) {
      const existingUsername = await User.findOne({
        username: validatedData.username,
        _id: { $ne: userId },
      });
      if (existingUsername) {
        return Response.json(
          { error: "This username is already taken" },
          { status: 400 }
        );
      }
    }

    // Check email uniqueness if provided
    if (validatedData.email) {
      const existingUsername = await User.findOne({
        email: validatedData.email,
        _id: { $ne: userId },
      });
      if (existingUsername) {
        return Response.json(
          { error: "This email is already taken" },
          { status: 400 }
        );
      }
    }

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { username, full_name, email, role },
      {
        new: true,
        runValidators: true,
      }
    ).select("-password -reset_token -reset_token_expires");

    if (!updatedUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({ user: updatedUser }, { status: 200 });
  } catch (error: any) {
    console.error("Admin edit user error:", error);
    return NextResponse.json(
      { error: "Failed to update user" },
      { status: 500 }
    );
  }
}
