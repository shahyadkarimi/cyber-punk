import type { NextRequest } from "next/server";
import User from "@/models/UsersModel";
import { loginSchema } from "@/lib/validation";
import { createAuthResponse } from "@/lib/auth";
import connectDB from "@/lib/connectDB";
import { signToken } from "@/lib/jwt";
import bcrypt from "bcryptjs";

export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const body = await request.json();

    // Validate input
    const validatedData = loginSchema.parse(body);

    // Find user by email
    const user = await User.findOne({ email: validatedData.email });
    if (!user) {
      return Response.json(
        { error: "Invalid email or password" },
        { status: 401 }
      );
    }

    // Check if user is active
    if (!user.is_active) {
      return Response.json(
        { error: "Your account is inactive" },
        { status: 401 }
      );
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(
      validatedData.password,
      user.password
    );
    if (!isPasswordValid) {
      return Response.json(
        { error: "Invalid email or password" },
        { status: 401 }
      );
    
    }
    // Update last login
    user.last_login_at = new Date();
    await user.save();

    // Generate JWT token
    const token = signToken({
      userId: user._id.toString(),
      email: user.email,
      role: user.role,
    });

    // Return user data without password
    const userData = {
      id: user._id,
      email: user.email,
      username: user.username,
      full_name: user.full_name,
      avatar_url: user.avatar_url,
      role: user.role,
      is_active: user.is_active,
      admin_approved: user.admin_approved,
      last_login_at: user.last_login_at,
    };

    // Return success message
    return createAuthResponse(
      {
        message: "Login successful",
        user: userData,
      },
      token
    );
  } catch (error: any) {
    console.error("Login error:", error);

    if (error.name === "ZodError") {
      return Response.json({ error: error.errors[0].message }, { status: 400 });
    }

    // Error handling
    return Response.json(
      { error: "Login failed. Please try again" },
      { status: 500 }
    );
  }
}
