import { NextResponse, type NextRequest } from "next/server";
import connectDB from "@/lib/connectDB";
import User from "@/models/UsersModel";
import { registerSchema } from "@/lib/validation";
import { createAuthResponse } from "@/lib/auth";
import { signToken } from "@/lib/jwt";

export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const body = await request.json();

    // Validate input
    const validatedData = registerSchema.parse(body);

    // Check if user already exists
    const existingUser = await User.findOne({ email: validatedData.email });
    if (existingUser) {
      return NextResponse.json(
        { error: "User with this email already exists" },
        { status: 400 }
      );
    }

    // Check username uniqueness if provided
    if (validatedData.username) {
      const existingUsername = await User.findOne({
        username: validatedData.username,
      });
      if (existingUsername) {
        return NextResponse.json(
          { error: "This username is already taken" },
          { status: 400 }
        );
      }
    }

    // Create new user
    const user = new User({
      email: validatedData.email,
      password: validatedData.password,
      full_name: validatedData.full_name,
      username: validatedData.username,
    });

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
      created_at: user.created_at,
    };

    // Return success message
    return createAuthResponse(
      {
        message: "Registration successful",
        user: userData,
      },
      token
    );
  } catch (error: any) {
    console.error("Register error:", error);

    if (error.name === "ZodError") {
      return NextResponse.json({ error: error.errors[0].message }, { status: 400 });
    }

    // Error handling
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern)[0];
      return NextResponse.json(
        {
          error: `This ${
            field === "email" ? "email" : "username"
          } is already taken`,
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Registration failed. Please try again" },
      { status: 500 }
    );
  }
}
