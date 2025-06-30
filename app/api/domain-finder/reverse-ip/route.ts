import { NextRequest, NextResponse } from "next/server";
import { redisClient } from "@/lib/redis/redis";
import { getAuthUser } from "@/lib/auth";
import { captchaGenerator } from "@/lib/captcha/captchaGenerator";
import { v4 as uuidv4 } from "uuid";
import { cookies } from "next/headers";

const DAILY_LIMIT = 3;
const ONE_DAY_SECONDS = 86400;

const API_KEY = "b37150c809c99870dd4ced2dd0316385";

export async function POST(request: NextRequest) {
  try {
    const { url } = await request.json();

    if (!url || typeof url !== "string") {
      return NextResponse.json({ error: "URL is required" }, { status: 400 });
    }

    const user = await getAuthUser(request);

    const userIp =
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

      const redisKey = `daily_reverse_ip_count:${userIp}`;
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

    const ip = await getIpFromUrl(url);

    const apiUrl = `https://api.xreverselabs.org/itsuka?apiKey=${API_KEY}&ip=${ip}`;
    const response = await fetch(apiUrl, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
      },
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: `API returned ${response.status}` },
        { status: response.status }
      );
    }

    const data = await response.json();

    if (!data.domains || !Array.isArray(data.domains)) {
      return NextResponse.json({ domains: [] });
    }

    if (!user) {
      (await cookies()).set("captcha_verified", "false");
    }

    return NextResponse.json({ domains: data.domains });
  } catch (error) {
    console.error("Reverse lookup error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

async function getIpFromUrl(url: string): Promise<string> {
  // Clean the URL input
  url = url.replace(/^https?:\/\//, "");

  // If it's already an IP, return it
  const ipPattern = /^(\d{1,3}\.){3}\d{1,3}$/;
  if (ipPattern.test(url)) {
    return url;
  }

  try {
    // Use DNS lookup service to get IP
    const dnsApi = `https://dns.google/resolve?name=${url}`;
    const response = await fetch(dnsApi);
    const data = await response.json();

    if (data.Answer && data.Answer.length > 0) {
      const ip = data.Answer[0].data;

      return ip;
    }

    throw new Error("Could not resolve IP");
  } catch (error) {
    console.error("Error getting IP from URL:", error);
    throw new Error("Failed to resolve IP address");
  }
}
