import { NextResponse } from "next/server";
import {
  MAG7,
  SECTORS,
  SEMIS,
  type HeatmapGroup,
  syntheticHeatmap,
} from "@/lib/data/heatmap";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const REVALIDATE_SECONDS = 60;

export async function GET() {
  const apiKey = process.env.POLYGON_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ groups: syntheticHeatmap(), demo: true });
  }

  const tickers = Array.from(
    new Set([
      ...SECTORS.map((s) => s.sym),
      ...MAG7.map((c) => c.sym),
      ...SEMIS.map((c) => c.sym),
    ]),
  );
  const url = `https://api.polygon.io/v2/snapshot/locale/us/markets/stocks/tickers?tickers=${tickers.join(",")}&apiKey=${apiKey}`;

  try {
    const res = await fetch(url, { next: { revalidate: REVALIDATE_SECONDS } });
    if (!res.ok) {
      return NextResponse.json({
        groups: syntheticHeatmap(),
        demo: true,
        error: `Polygon ${res.status}`,
      });
    }
    const data = await res.json();
    const map = new Map<string, number>();
    for (const t of (data?.tickers ?? []) as any[]) {
      const sym = String(t?.ticker ?? "");
      const change = Number(t?.todaysChangePerc ?? 0);
      if (sym) map.set(sym, change);
    }

    const groups: HeatmapGroup[] = [
      {
        id: "sectors",
        label: "S&P Sectors",
        cells: SECTORS.map((s) => ({
          symbol: s.sym,
          name: s.name,
          changePct: map.get(s.sym) ?? 0,
        })),
      },
      {
        id: "mag7",
        label: "Magnificent 7",
        cells: MAG7.map((c) => ({
          symbol: c.sym,
          name: c.name,
          marketCapBn: c.cap,
          changePct: map.get(c.sym) ?? 0,
        })),
      },
      {
        id: "semis",
        label: "Semiconductors",
        cells: SEMIS.map((c) => ({
          symbol: c.sym,
          name: c.name,
          marketCapBn: c.cap,
          changePct: map.get(c.sym) ?? 0,
        })),
      },
    ];
    return NextResponse.json({ groups, demo: false });
  } catch (err) {
    return NextResponse.json({
      groups: syntheticHeatmap(),
      demo: true,
      error: (err as Error).message,
    });
  }
}
