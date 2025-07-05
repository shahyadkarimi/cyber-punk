import { NextResponse, type NextRequest } from "next/server";
import connectDB from "@/lib/connectDB";
import User from "@/models/UsersModel";
import { registerSchema } from "@/lib/validation";
import { createAuthResponse } from "@/lib/auth";
import { signToken } from "@/lib/jwt";
import bcrypt from "bcryptjs";

async function generateUniqueReferralCode(): Promise<number> {
  const min = 1000000000;
  const max = 9999999999;

  let code = 0;
  let exists = true;

  while (exists) {
    code = Math.floor(Math.random() * (max - min + 1) + min);
    exists = (await User.exists({ referral_code: code })) !== null;
  }

  return code;
}

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

    // Hash password before saving
    const hashedPassword = await bcrypt.hash(validatedData.password, 10);

    const userCount = await User.countDocuments({});
    const generatedId = userCount + 1;

    const referralCode = await generateUniqueReferralCode();

    // Create new user
    const user = new User({
      id: generatedId,
      email: validatedData.email,
      password: hashedPassword,
      full_name: validatedData.full_name,
      username: validatedData.username,
      role: validatedData.role,
      referral_code: referralCode,
      parent_referral: Number(validatedData.parent_referral) || null,
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
      id: user.id,
      email: user.email,
      username: user.username,
      full_name: user.full_name,
      avatar_url: user.avatar_url,
      role: user.role,
      is_active: user.is_active,
      admin_approved: user.admin_approved,
      referral_code: user.referral_code,
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
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      );
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
