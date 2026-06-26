export type NewsRelevance =
  | "fed"
  | "inflation"
  | "treasury"
  | "semis"
  | "tech"
  | "geopolitics"
  | "breaking"
  | "other";

export interface NewsItem {
  id: string;
  headline: string;
  summary: string;
  source: string;
  url: string;
  ts: number; // epoch ms
  category: string;
  relevance: NewsRelevance;
}

export interface NewsResponse {
  items: NewsItem[];
  demo: boolean;
  error?: string;
}

export function categorizeNews(text: string): NewsRelevance {
  const t = text.toLowerCase();
  if (/\bbreaking\b/.test(t)) return "breaking";
  if (/\bfed\b|federal reserve|fomc|powell|jerome powell|interest rate|rate cut|rate hike/.test(t)) return "fed";
  if (/inflation|\bcpi\b|\bppi\b|core pce|disinflation/.test(t)) return "inflation";
  if (/treasury|t-bond|t-note|bond yield|yield curve|treasuries|bond auction/.test(t)) return "treasury";
  if (/nvidia|nvda|\bamd\b|tsmc|\btsm\b|intel|asml|semiconductor|chip|micron|broadcom|avgo/.test(t)) return "semis";
  if (/apple|aapl|microsoft|msft|google|googl|amazon|amzn|meta|tesla|tsla|earnings|guidance/.test(t)) return "tech";
  if (/ukraine|russia|china|taiwan|israel|hamas|iran|north korea|sanction|tariff|trade war|opec/.test(t)) return "geopolitics";
  return "other";
}

// Heuristic: strip pure politics / lifestyle noise unless it intersects markets.
export function isMarketNoise(text: string): boolean {
  const t = text.toLowerCase();
  const polittical = /(campaign|debate|caucus|primary|partisan|congress|senate|house)/.test(t);
  const marketRelevant =
    /market|stock|economy|tariff|trade|tax|sec|fed|inflation|treasury|bond|earnings|gdp/.test(t);
  if (polittical && !marketRelevant) return true;
  if (/(celebrity|kardashian|hollywood|netflix series|grammys|oscars)/.test(t) && !marketRelevant) return true;
  return false;
}

export function demoNewsItems(): NewsItem[] {
  const now = Date.now();
  const m = 60 * 1000;
  return [
    { id: "d1", headline: "Powell: Fed prepared to hold rates higher for longer if inflation persists", summary: "", source: "Bloomberg", url: "https://example.com/news/1", ts: now - 3 * m, category: "general", relevance: "fed" },
    { id: "d2", headline: "Core CPI prints hotter than expected at 0.4% m/m, yields jump", summary: "", source: "Reuters", url: "https://example.com/news/2", ts: now - 14 * m, category: "general", relevance: "inflation" },
    { id: "d3", headline: "Nvidia tops $4T market cap as AI demand accelerates into Q4", summary: "", source: "WSJ", url: "https://example.com/news/3", ts: now - 45 * m, category: "general", relevance: "semis" },
    { id: "d4", headline: "10-year Treasury yield breaks above 4.5% on hawkish Fed signals", summary: "", source: "CNBC", url: "https://example.com/news/4", ts: now - 90 * m, category: "general", relevance: "treasury" },
    { id: "d5", headline: "Apple beats Q4 estimates, services revenue at record high", summary: "", source: "MarketWatch", url: "https://example.com/news/5", ts: now - 2 * 60 * m, category: "general", relevance: "tech" },
    { id: "d6", headline: "BREAKING: Treasury auction sees weak demand, yields spike", summary: "", source: "Reuters", url: "https://example.com/news/6", ts: now - 3 * 60 * m, category: "general", relevance: "breaking" },
    { id: "d7", headline: "OPEC+ extends production cuts through Q1, crude rallies 3%", summary: "", source: "FT", url: "https://example.com/news/7", ts: now - 4 * 60 * m, category: "general", relevance: "geopolitics" },
    { id: "d8", headline: "TSMC raises 2026 capex guidance on AI chip orders", summary: "", source: "FT", url: "https://example.com/news/8", ts: now - 6 * 60 * m, category: "general", relevance: "semis" },
    { id: "d9", headline: "Fed minutes show divided committee on next rate move", summary: "", source: "Bloomberg", url: "https://example.com/news/9", ts: now - 8 * 60 * m, category: "general", relevance: "fed" },
  ];
}
