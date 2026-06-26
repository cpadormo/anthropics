// Synthetic options summary. V4 will replace the synthesis layer with a real
// provider (SpotGamma / Unusual Whales / CBOE) behind the same shape; widget
// stays the same.
//
// Strikes anchor to the live spot so the surface tracks the price; OI values
// reseed every 5 minutes to look stable mid-session.

export interface OptionStrike {
  strike: number;
  oi: number;
}

export interface OptionsSummary {
  symbol: string;
  spot: number;
  gexBn: number; // $B gamma exposure (negative = short gamma)
  dealerPos: "Long Gamma" | "Short Gamma" | "Neutral";
  maxPain: number;
  putCallOi: number;
  expectedMove1d: number;
  expectedMove1w: number;
  callStrikes: OptionStrike[];
  putStrikes: OptionStrike[];
}

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

export function synthesizeOptions(
  symbol: string,
  spot: number,
  vix: number,
): OptionsSummary {
  // 5-minute bucket so the values don't churn every render.
  const bucket = Math.floor(Date.now() / (5 * 60 * 1000));
  const seed = hash(symbol) ^ bucket;
  const rnd = mulberry32(seed);

  // GEX: roughly -2B to +3B, biased slightly positive in benign vol regimes.
  const vixSkew = Math.max(0, 1 - (vix - 12) / 20);
  const gexBn = (rnd() - 0.4) * 4 + (vixSkew - 0.5) * 1.2;
  const dealerPos: OptionsSummary["dealerPos"] =
    gexBn > 0.5 ? "Long Gamma" : gexBn < -0.5 ? "Short Gamma" : "Neutral";

  // Max pain near spot ± 0.5%.
  const maxPain = roundToStep(spot * (1 + (rnd() - 0.5) * 0.01), 25);
  const putCallOi = 0.7 + rnd() * 0.6;

  const expectedMove1d = spot * (vix / 100) * Math.sqrt(1 / 252);
  const expectedMove1w = expectedMove1d * Math.sqrt(5);

  // Top 3 OI strikes either side of spot, rounded to a credible NQ strike spacing.
  const callStrikes: OptionStrike[] = [1, 2, 3].map((i) => ({
    strike: roundToStep(spot * (1 + 0.005 * i), 25),
    oi: Math.round(6000 + rnd() * 14000),
  }));
  const putStrikes: OptionStrike[] = [1, 2, 3].map((i) => ({
    strike: roundToStep(spot * (1 - 0.005 * i), 25),
    oi: Math.round(6000 + rnd() * 14000),
  }));

  return {
    symbol,
    spot,
    gexBn,
    dealerPos,
    maxPain,
    putCallOi,
    expectedMove1d,
    expectedMove1w,
    callStrikes,
    putStrikes,
  };
}

function roundToStep(v: number, step: number): number {
  return Math.round(v / step) * step;
}
