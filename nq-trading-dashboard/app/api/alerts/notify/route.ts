import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Channel = "discord" | "sms";

interface NotifyBody {
  alert: {
    id: string;
    symbol: string;
    condition: "above" | "below";
    price: number;
    note?: string;
    channels: string[];
  };
  currentPrice: number;
}

async function sendDiscord(message: string): Promise<string> {
  const url = process.env.DISCORD_WEBHOOK_URL;
  if (!url) return "DISCORD_WEBHOOK_URL not set";
  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ content: message }),
    });
    return res.ok ? "sent" : `error ${res.status}`;
  } catch (err) {
    return `error ${(err as Error).message}`;
  }
}

async function sendSms(message: string): Promise<string> {
  const sid = process.env.TWILIO_ACCOUNT_SID;
  const token = process.env.TWILIO_AUTH_TOKEN;
  const from = process.env.TWILIO_FROM_NUMBER;
  const to = process.env.TWILIO_TO_NUMBER;
  if (!sid || !token || !from || !to) return "Twilio not configured";
  try {
    const auth = Buffer.from(`${sid}:${token}`).toString("base64");
    const res = await fetch(
      `https://api.twilio.com/2010-04-01/Accounts/${sid}/Messages.json`,
      {
        method: "POST",
        headers: {
          Authorization: `Basic ${auth}`,
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({ From: from, To: to, Body: message }).toString(),
      },
    );
    return res.ok ? "sent" : `error ${res.status}`;
  } catch (err) {
    return `error ${(err as Error).message}`;
  }
}

export async function POST(req: Request) {
  let body: NotifyBody;
  try {
    body = (await req.json()) as NotifyBody;
  } catch {
    return NextResponse.json({ error: "invalid body" }, { status: 400 });
  }
  const alert = body?.alert;
  if (!alert) return NextResponse.json({ error: "missing alert" }, { status: 400 });

  const message = `🚨 ${alert.symbol} ${alert.condition} ${alert.price} · last ${Number(
    body.currentPrice ?? 0,
  ).toFixed(2)}${alert.note ? ` · ${alert.note}` : ""}`;

  const channels = (alert.channels ?? []).filter(
    (c): c is Channel => c === "discord" || c === "sms",
  );
  const results: Record<string, string> = {};
  await Promise.all(
    channels.map(async (c) => {
      if (c === "discord") results.discord = await sendDiscord(message);
      if (c === "sms") results.sms = await sendSms(message);
    }),
  );
  return NextResponse.json({ ok: true, channels: results });
}
