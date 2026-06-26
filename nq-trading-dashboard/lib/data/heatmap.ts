// Synthetic constituent heatmap. V5 will route real quotes (Polygon /
// IEX Cloud / Finnhub) for sectors, Mag 7, and semis behind the same
// HeatmapGroup shape so the widget never changes.

export interface HeatmapCell {
  symbol: string;
  name: string;
  changePct: number;
  marketCapBn?: number;
}

export interface HeatmapGroup {
  id: string;
  label: string;
  cells: HeatmapCell[];
}

const SECTORS = [
  { sym: "XLK",  name: "Tech" },
  { sym: "XLF",  name: "Financials" },
  { sym: "XLE",  name: "Energy" },
  { sym: "XLV",  name: "Healthcare" },
  { sym: "XLY",  name: "Cons. Discr." },
  { sym: "XLP",  name: "Cons. Staples" },
  { sym: "XLI",  name: "Industrials" },
  { sym: "XLB",  name: "Materials" },
  { sym: "XLU",  name: "Utilities" },
  { sym: "XLRE", name: "Real Estate" },
  { sym: "XLC",  name: "Comms" },
];

const MAG7 = [
  { sym: "AAPL",  name: "Apple",     cap: 3400 },
  { sym: "MSFT",  name: "Microsoft", cap: 3200 },
  { sym: "NVDA",  name: "Nvidia",    cap: 3800 },
  { sym: "GOOGL", name: "Alphabet",  cap: 2100 },
  { sym: "AMZN",  name: "Amazon",    cap: 2000 },
  { sym: "META",  name: "Meta",      cap: 1500 },
  { sym: "TSLA",  name: "Tesla",     cap: 1100 },
];

const SEMIS = [
  { sym: "NVDA", name: "Nvidia",     cap: 3800 },
  { sym: "AVGO", name: "Broadcom",   cap: 900 },
  { sym: "TSM",  name: "TSMC",       cap: 1000 },
  { sym: "AMD",  name: "AMD",        cap: 280 },
  { sym: "ASML", name: "ASML",       cap: 360 },
  { sym: "QCOM", name: "Qualcomm",   cap: 200 },
  { sym: "TXN",  name: "Texas Instr", cap: 180 },
  { sym: "INTC", name: "Intel",      cap: 130 },
  { sym: "MU",   name: "Micron",     cap: 110 },
  { sym: "AMAT", name: "Applied Mat", cap: 180 },
];

function mulberry32(seed: number) {
  return function () {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function hash(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function syntheticChange(symbol: string, magnitude: number): number {
  // Stable within a 60s bucket so colors don't flicker.
  const bucket = Math.floor(Date.now() / (60 * 1000));
  const rnd = mulberry32(hash(symbol) ^ bucket);
  // Slightly correlated by drawing two samples and blending.
  return ((rnd() - 0.5) * 1.4 + (rnd() - 0.5) * 0.6) * magnitude;
}

export function syntheticHeatmap(): HeatmapGroup[] {
  return [
    {
      id: "sectors",
      label: "S&P Sectors",
      cells: SECTORS.map((s) => ({
        symbol: s.sym,
        name: s.name,
        changePct: syntheticChange(s.sym, 2),
      })),
    },
    {
      id: "mag7",
      label: "Magnificent 7",
      cells: MAG7.map((c) => ({
        symbol: c.sym,
        name: c.name,
        marketCapBn: c.cap,
        changePct: syntheticChange(c.sym, 2.8),
      })),
    },
    {
      id: "semis",
      label: "Semiconductors",
      cells: SEMIS.map((c) => ({
        symbol: c.sym,
        name: c.name,
        marketCapBn: c.cap,
        changePct: syntheticChange(c.sym, 3.5),
      })),
    },
  ];
}
