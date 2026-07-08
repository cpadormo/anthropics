import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Surfaces which providers are configured so the client can route correctly.
// Cheap: just reads env vars; doesn't open any connections.
export async function GET() {
  return NextResponse.json({
    db: !!process.env.DATABASE_URL,
    finnhub: !!process.env.FINNHUB_API_KEY,
    anthropic: !!process.env.ANTHROPIC_API_KEY,
    tradovate: !!process.env.TRADOVATE_USERNAME,
  });
}
