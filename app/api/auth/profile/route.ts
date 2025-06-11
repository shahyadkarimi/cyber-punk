import type { NextRequest } from "next/server"
import User from "@/models/UsersModel"
import { updateProfileSchema } from "@/lib/validation"
import { getAuthUser } from "@/lib/auth"
import connectDB from "@/lib/connectDB"

export async function POST(request: NextRequest) {
  try {
    await connectDB()

    // Get authenticated user
    const authUser = await getAuthUser(request)
    if (!authUser) {
      return Response.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()

    // Validate input
    const validatedData = updateProfileSchema.parse(body)

    // Check username uniqueness if provided
    if (validatedData.username) {
      const existingUsername = await User.findOne({
        username: validatedData.username,
        _id: { $ne: authUser.userId },
      })
      if (existingUsername) {
        return Response.json({ error: "This username is already taken" }, { status: 400 })
      }
    }

    // Update user
    const user = await User.findByIdAndUpdate(
      authUser.userId,
      {
        ...validatedData,
        updated_at: new Date(),
      },
      { new: true, select: "-password -reset_token -reset_token_expires" },
    )

    if (!user) {
      return Response.json({ error: "User not found" }, { status: 404 })
    }

    return Response.json(
      {
        message: "Profile updated successfully",
        user,
      },
      { status: 200 },
    )
  } catch (error: any) {
    console.error("Update profile error:", error)

    if (error.name === "ZodError") {
      return Response.json({ error: error.errors[0].message }, { status: 400 })
    }

    if (error.code === 11000) {
      return Response.json({ error: "This username is already taken" }, { status: 400 })
    }

    return Response.json({ error: "Failed to update profile" }, { status: 500 })
  }
}
