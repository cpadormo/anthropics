import "server-only";

// Server-only Tradovate REST helper. Caches the accessToken so order
// placement and account lookups don't re-authenticate on every call.
// The cached token refreshes when expiration is within 60s.

const AUTH_URL = (env: string) =>
  env === "live"
    ? "https://live.tradovateapi.com/v1/auth/accessTokenRequest"
    : "https://demo.tradovateapi.com/v1/auth/accessTokenRequest";

const API_BASE = (env: string) =>
  env === "live"
    ? "https://live.tradovateapi.com/v1"
    : "https://demo.tradovateapi.com/v1";

interface CachedAuth {
  accessToken: string;
  mdAccessToken: string;
  expiration: number;
  env: string;
  userId: number;
  name: string;
}

let cached: CachedAuth | null = null;

async function authenticate(): Promise<CachedAuth> {
  const env = process.env.TRADOVATE_ENV ?? "demo";
  const cid = Number(process.env.TRADOVATE_CID);
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
    throw new Error(
      "Tradovate credentials missing. Set TRADOVATE_USERNAME, TRADOVATE_PASSWORD, TRADOVATE_CID, TRADOVATE_SECRET.",
    );
  }
  const res = await fetch(AUTH_URL(env), {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(payload),
    cache: "no-store",
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok || !data.accessToken) {
    throw new Error(data.errorText ?? `Tradovate auth ${res.status}`);
  }
  return {
    accessToken: data.accessToken,
    mdAccessToken: data.mdAccessToken,
    expiration: Date.parse(data.expirationTime) || Date.now() + 60 * 60 * 1000,
    env,
    userId: data.userId,
    name: data.name,
  };
}

export async function getAuth(): Promise<CachedAuth> {
  if (cached && cached.expiration > Date.now() + 60_000) return cached;
  cached = await authenticate();
  return cached;
}

export async function tradovateGet<T = unknown>(path: string): Promise<T> {
  const auth = await getAuth();
  const res = await fetch(`${API_BASE(auth.env)}${path}`, {
    headers: { Authorization: `Bearer ${auth.accessToken}` },
    cache: "no-store",
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Tradovate ${path} ${res.status}: ${text.slice(0, 300)}`);
  }
  return (await res.json()) as T;
}

export async function tradovatePost<T = unknown>(
  path: string,
  body: unknown,
): Promise<T> {
  const auth = await getAuth();
  const res = await fetch(`${API_BASE(auth.env)}${path}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${auth.accessToken}`,
      "content-type": "application/json",
    },
    body: JSON.stringify(body),
    cache: "no-store",
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Tradovate ${path} ${res.status}: ${text.slice(0, 300)}`);
  }
  return (await res.json()) as T;
}
