import type { NextRequest } from "next/server"
import { clearAuthResponse } from "@/lib/auth"

export async function POST(request: NextRequest) {
  try {
    return clearAuthResponse({ message: "Logout successful" })
  } catch (error: any) {
    console.error("Logout error:", error)

    return Response.json({ error: "Logout failed" }, { status: 500 })
  }
}
