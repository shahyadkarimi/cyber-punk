import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/lib/auth";
import { cookies } from "next/headers";
import { captchaGenerator } from "@/lib/captcha/captchaGenerator";
import { v4 as uuidv4 } from "uuid";
import { redisClient } from "@/lib/redis/redis";

const DAILY_LIMIT = 3;
const ONE_DAY_SECONDS = 86400;

export async function POST(request: NextRequest) {
  try {
    const { url } = await request.json();

    if (!url) {
      return NextResponse.json({ error: "URL is required" }, { status: 400 });
    }

    const user = await getAuthUser(request);

    const ip =
      request.headers.get("x-forwarded-for")?.split(",")[0] || "unknown";

    if (!user) {
      const captchaVerified =
        (await cookies()).get("captcha_verified")?.value === "true";

      if (!captchaVerified) {
        const { question, answer } = captchaGenerator.generateChallenge();
        const captchaId = uuidv4();

        await redisClient.set(`captcha:${captchaId}`, answer, { ex: 300 });

        return NextResponse.json(
          {
            error: "CAPTCHA verification required.",
            captchaRequired: true,
            captcha: {
              captchaId,
              question,
            },
          },
          { status: 403 }
        );
      }

      const redisKey = `daily_sub_domains_count:${ip}`;
      let count = (await redisClient.get(redisKey)) || "0";

      if (count === null) {
        await redisClient.set(redisKey, "1", { ex: ONE_DAY_SECONDS });
      } else {
        await redisClient.incr(redisKey);

        const ttl = await redisClient.ttl(redisKey);
        if (ttl === -1) {
          await redisClient.expire(redisKey, ONE_DAY_SECONDS);
        }
      }

      const scanCount = count === null ? 1 : Number(count) + 1;

      if (scanCount > DAILY_LIMIT) {
        return NextResponse.json(
          {
            error: `Daily scan limit (${DAILY_LIMIT}) exceeded. Try again tomorrow.`,
          },
          { status: 429 }
        );
      }
    }

    const domain = url.replace(/^https?:\/\//, "");

    const crtUrl = `https://crt.sh/?q=%25.${domain}&output=json`;
    const response = await fetch(crtUrl, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
      },
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: `crt.sh API returned ${response.status}` },
        { status: response.status }
      );
    }

    const data = await response.json();
    const subdomains = new Set<string>();

    if (Array.isArray(data)) {
      for (const entry of data) {
        if (entry.name_value) {
          const domains = entry.name_value.split("\n");
          for (const subdomain of domains) {
            subdomains.add(subdomain.trim());
          }
        }
      }
    }

    if (!user) {
      (await cookies()).set("captcha_verified", "false");
    }

    const result = { subdomains: Array.from(subdomains) };
    return NextResponse.json(result);
  } catch (error) {
    console.error("Error in subdomain lookup:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
