import { NextResponse, type NextRequest } from "next/server"
import User from "@/models/UsersModel"
import { getAuthUser } from "@/lib/auth"
import connectDB from "@/lib/connectDB"

export async function GET(request: NextRequest) {
  try {
    await connectDB()

    // Get authenticated user
    const authUser = await getAuthUser(request)
    if (!authUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Find user
    const user = await User.findById(authUser.userId).select("-password -reset_token -reset_token_expires")
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    return NextResponse.json({ user }, { status: 200 })
  } catch (error: any) {
    console.error("Get current user error:", error)

    // Error handling
    return NextResponse.json({ error: "Failed to get user information" }, { status: 500 })
  }
}
