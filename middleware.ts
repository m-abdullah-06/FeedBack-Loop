import { NextRequest, NextResponse } from "next/server";

const rateLimit = new Map<string, { count: number; timestamp: number }>();

export function middleware(req: NextRequest) {
  if (req.nextUrl.pathname === "/api/analyze" || req.nextUrl.pathname === "/api/preview") {
    const ip = req.headers.get("x-forwarded-for") ?? "unknown";
    const now = Date.now();
    const windowMs = 60 * 1000;
    const maxRequests = 10;

    const entry = rateLimit.get(ip);

    if (!entry || now - entry.timestamp > windowMs) {
      rateLimit.set(ip, { count: 1, timestamp: now });
    } else if (entry.count >= maxRequests) {
      return NextResponse.json(
        { error: "Too many requests. Please wait a minute." },
        { status: 429 }
      );
    } else {
      entry.count++;
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/api/analyze", "/api/preview"],
};