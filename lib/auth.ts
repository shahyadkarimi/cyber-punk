import { NextResponse, type NextRequest } from "next/server";
import { verifyToken } from "./jwt";

export async function getAuthUser(request: NextRequest) {
  try {
    const token = request.cookies.get("auth-token")?.value;
    if (!token) {
      return null;
    }

    const payload = verifyToken(token);
    return payload;
  } catch (error) {
    return null;
  }
}

export function createAuthResponse(data: any, token?: string) {
  const response = NextResponse.json(data);

  if (token) {
    try {
      response.cookies.set("auth-token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 60 * 60 * 24 * 7, // 7 days
        path: "/",
      });
    } catch (err) {
      return NextResponse.json(
        { error: "Failed to set auth token cookie" },
        { status: 500 }
      );
    }
  }

  return response;
}

export function clearAuthResponse(data: any) {
  const response = NextResponse.json(data);
  response.cookies.delete("auth-token");
  return response;
}
