import { NextResponse } from "next/server";
import {
  categorizeNews,
  demoNewsItems,
  isMarketNoise,
  type NewsItem,
} from "@/lib/data/news";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const FINNHUB_REVALIDATE_SECONDS = 120;
const MAX_ITEMS = 25;

export async function GET() {
  const token = process.env.FINNHUB_API_KEY;
  if (!token) {
    return NextResponse.json({ items: demoNewsItems(), demo: true });
  }
  try {
    const res = await fetch(
      `https://finnhub.io/api/v1/news?category=general&token=${token}`,
      { next: { revalidate: FINNHUB_REVALIDATE_SECONDS } },
    );
    if (!res.ok) {
      return NextResponse.json({
        items: demoNewsItems(),
        demo: true,
        error: `Finnhub ${res.status}`,
      });
    }
    const raw = (await res.json()) as any[];
    const items: NewsItem[] = raw
      .map((n): NewsItem => ({
        id: String(n.id),
        headline: String(n.headline ?? ""),
        summary: String(n.summary ?? ""),
        source: String(n.source ?? ""),
        url: String(n.url ?? ""),
        ts: Number(n.datetime) * 1000,
        category: String(n.category ?? "general"),
        relevance: categorizeNews(`${n.headline ?? ""} ${n.summary ?? ""}`),
      }))
      .filter((n) => n.headline && !isMarketNoise(`${n.headline} ${n.summary}`))
      .sort((a, b) => b.ts - a.ts)
      .slice(0, MAX_ITEMS);
    return NextResponse.json({ items, demo: false });
  } catch (err) {
    return NextResponse.json({
      items: demoNewsItems(),
      demo: true,
      error: (err as Error).message,
    });
  }
}
