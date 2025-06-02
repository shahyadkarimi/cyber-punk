import { NextResponse } from "next/server"
import { isRapidApiConfigured } from "@/lib/api-services"

export async function GET() {
  return NextResponse.json({
    configured: isRapidApiConfigured(),
    provider: "RapidAPI",
  })
}
