import { NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";
import { captchaGenerator } from "@/lib/captcha/captchaGenerator";

const captchaStore = new Map<string, string>();

export async function GET() {
  const { question, answer } = captchaGenerator.generateChallenge();
  const captchaId = uuidv4();

  captchaStore.set(captchaId, answer);

  return NextResponse.json({
    captchaId,
    question,
  });
}


export { captchaStore };
