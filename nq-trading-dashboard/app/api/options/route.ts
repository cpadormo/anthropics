import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Map NQ-related futures to the equity-index symbols Unusual Whales
// covers. The dashboard treats them as proxies in the options surface
// (NQ -> NDX, ES -> SPX, RTY -> IWM, YM -> DIA).
const UW_SYMBOL_MAP: Record<string, string> = {
  NQ: "NDX",
  ES: "SPX",
  RTY: "IWM",
  YM: "DIA",
};

async function uwFetch(path: string, token: string): Promise<any | null> {
  try {
    const res = await fetch(`https://api.unusualwhales.com${path}`, {
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${token}`,
      },
      next: { revalidate: 60 },
    });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

export async function GET(req: Request) {
  const url = new URL(req.url);
  const root = url.searchParams.get("symbol") ?? "NQ";
  const token = process.env.UNUSUAL_WHALES_API_KEY;

  if (!token) {
    return NextResponse.json({ demo: true });
  }

  const uwSymbol = UW_SYMBOL_MAP[root] ?? root;

  // Defensive multi-endpoint probe. Tiers vary; we take whatever the
  // API returns and let the client merge with the local synthesizer
  // for any missing fields.
  const [greekRes, maxPainRes, statsRes] = await Promise.all([
    uwFetch(`/api/stock/${uwSymbol}/greek-exposure`, token),
    uwFetch(`/api/stock/${uwSymbol}/max-pain`, token),
    uwFetch(`/api/stock/${uwSymbol}/option-stats`, token),
  ]);

  const summary: Record<string, unknown> = { symbol: root };
  let anyData = false;

  if (greekRes?.data) {
    anyData = true;
    // Adapt the typical UW shape: total gamma exposure in dollars
    const gex = Array.isArray(greekRes.data)
      ? greekRes.data.reduce(
          (acc: number, x: any) => acc + Number(x.gamma_exposure ?? 0),
          0,
        )
      : Number(greekRes.data.gamma_exposure ?? 0);
    summary.gexBn = gex / 1e9;
    summary.dealerPos =
      gex > 5e8 ? "Long Gamma" : gex < -5e8 ? "Short Gamma" : "Neutral";
  }

  if (maxPainRes?.data) {
    anyData = true;
    summary.maxPain = Number(
      maxPainRes.data.max_pain ?? maxPainRes.data.maxPain ?? 0,
    );
  }

  if (statsRes?.data) {
    anyData = true;
    const d = statsRes.data;
    if (d.put_call_oi_ratio != null)
      summary.putCallOi = Number(d.put_call_oi_ratio);
    if (Array.isArray(d.top_call_strikes)) {
      summary.callStrikes = d.top_call_strikes
        .slice(0, 3)
        .map((s: any) => ({ strike: Number(s.strike), oi: Number(s.oi) }));
    }
    if (Array.isArray(d.top_put_strikes)) {
      summary.putStrikes = d.top_put_strikes
        .slice(0, 3)
        .map((s: any) => ({ strike: Number(s.strike), oi: Number(s.oi) }));
    }
  }

  if (!anyData) {
    return NextResponse.json({ demo: true });
  }
  return NextResponse.json({ summary, demo: false });
}
