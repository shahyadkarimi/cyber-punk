import { NextRequest, NextResponse } from "next/server";
import { redisClient } from "@/lib/redis/redis";
import { cookies } from "next/headers";

export async function POST(request: NextRequest) {
  const { captchaId, answer } = await request.json();

  if (!captchaId || !answer) {
    return NextResponse.json(
      { error: "Missing CAPTCHA data" },
      { status: 400 }
    );
  }

  const savedAnswer = await redisClient.get(`captcha:${captchaId}`);

  if (!savedAnswer) {
    return NextResponse.json(
      { success: false, error: "Invalid or expired CAPTCHA ID" },
      { status: 400 }
    );
  }

  if (String(savedAnswer).toLowerCase() === answer.toLowerCase()) {
    await redisClient.del(`captcha:${captchaId}`);
    (await cookies()).set("captcha_verified", "true");

    return NextResponse.json({ success: true });
  } else {
    return NextResponse.json(
      { success: false, error: "Incorrect CAPTCHA answer" },
      { status: 400 }
    );
  }
}
