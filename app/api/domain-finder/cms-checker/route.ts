import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/lib/auth";
import { headers } from "next/headers";
import { detectCMS } from "@/lib/cms-detection";
import { resultLogger } from "@/lib/result-logger";

export async function POST(request: NextRequest) {
  const startTime = Date.now();

  try {
    const body = await request.json();
    const { url } = body;

    if (!url || typeof url !== "string") {
      return NextResponse.json({ error: "URL is required" }, { status: 400 });
    }

    const headersList = headers();
    const forwardedFor = (await headersList).get("x-forwarded-for");
    const clientIp = forwardedFor ? forwardedFor.split(",")[0] : "unknown";
    const userAgent = (await headersList).get("user-agent") || "unknown";
    const authUser = await getAuthUser(request);

    // CMS Detection (always fresh)
    const cmsResult = await detectCMS(url);
    const result = { url, ...cmsResult };

    // Log result
    resultLogger.log({
      timestamp: Date.now(),
      action: "cms_check",
      query: url,
      results: cmsResult.cms,
      clientIp,
      userAgent,
      processingTime: Date.now() - startTime,
    });

    return NextResponse.json(result);
  } catch (err) {
    console.error("CMS Check API Error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
