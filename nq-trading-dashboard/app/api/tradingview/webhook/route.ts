import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Receives POSTs from TradingView alert webhooks. If
// TRADINGVIEW_WEBHOOK_SECRET is set, requests must carry the same
// secret via ?secret=... or X-Webhook-Secret header.
//
// When DISCORD_WEBHOOK_URL is configured, payloads are mirrored into
// Discord so TradingView alerts land in the same channel as price
// alerts from V5-3.
export async function POST(req: Request) {
  const secret = process.env.TRADINGVIEW_WEBHOOK_SECRET;
  if (secret) {
    const url = new URL(req.url);
    const provided =
      url.searchParams.get("secret") || req.headers.get("x-webhook-secret");
    if (provided !== secret) {
      return NextResponse.json({ error: "unauthorized" }, { status: 401 });
    }
  }

  const text = await req.text();
  let payload: any;
  try {
    payload = JSON.parse(text);
  } catch {
    payload = { raw: text };
  }

  const discord = process.env.DISCORD_WEBHOOK_URL;
  if (discord) {
    try {
      const content =
        "📈 TradingView alert: ```" +
        JSON.stringify(payload).slice(0, 1500) +
        "```";
      await fetch(discord, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ content }),
      });
    } catch {
      /* swallow — best effort */
    }
  }

  return NextResponse.json({ ok: true, received: payload });
}
