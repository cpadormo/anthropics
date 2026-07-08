import { NextResponse } from "next/server";

// Tradovate REST auth endpoints. Demo uses paper accounts; live uses funded.
const AUTH_URL = (env: string) =>
  env === "live"
    ? "https://live.tradovateapi.com/v1/auth/accessTokenRequest"
    : "https://demo.tradovateapi.com/v1/auth/accessTokenRequest";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function POST() {
  const env = process.env.TRADOVATE_ENV ?? "demo";
  const cidRaw = process.env.TRADOVATE_CID;
  const cid = cidRaw ? Number(cidRaw) : NaN;

  const payload = {
    name: process.env.TRADOVATE_USERNAME,
    password: process.env.TRADOVATE_PASSWORD,
    appId: process.env.TRADOVATE_APP_ID ?? "NQDesk",
    appVersion: "1.0",
    cid,
    sec: process.env.TRADOVATE_SECRET,
    deviceId: process.env.TRADOVATE_DEVICE_ID ?? "nqdesk-dev",
  };

  if (!payload.name || !payload.password || !cid || Number.isNaN(cid) || !payload.sec) {
    return NextResponse.json(
      {
        error:
          "Tradovate credentials missing. Set TRADOVATE_USERNAME, TRADOVATE_PASSWORD, TRADOVATE_CID, TRADOVATE_SECRET (and TRADOVATE_ENV=demo|live).",
      },
      { status: 400 },
    );
  }

  let res: Response;
  try {
    res = await fetch(AUTH_URL(env), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      cache: "no-store",
    });
  } catch (e) {
    return NextResponse.json(
      { error: `Tradovate auth network error: ${(e as Error).message}` },
      { status: 502 },
    );
  }

  const data = await res.json().catch(() => ({}));
  if (!res.ok || data.errorText || !data.mdAccessToken) {
    return NextResponse.json(
      { error: data.errorText ?? `Auth failed (${res.status})`, details: data },
      { status: res.status >= 400 ? res.status : 500 },
    );
  }

  // Only the market-data token and expiration leave the server.
  // The full accessToken (which permits order entry) stays here for now;
  // V3+ trading flows will add a separate scoped endpoint.
  return NextResponse.json({
    mdAccessToken: data.mdAccessToken,
    expiration: data.expirationTime,
    env,
  });
}
