import { nanoid } from "nanoid";

export type Side = "long" | "short";

export const POINT_VALUES: Record<string, number> = {
  NQ: 20,
  MNQ: 2,
  ES: 50,
  MES: 5,
  RTY: 50,
  M2K: 5,
  YM: 5,
  MYM: 0.5,
};

export interface Trade {
  id: string;
  symbol: string;
  side: Side;
  entryTime: number;
  exitTime: number | null;
  entry: number;
  exit: number | null;
  contracts: number;
  stopLoss: number | null;
  takeProfit: number | null;
  pointValue: number;
  pnlPoints: number | null;
  pnlDollars: number | null;
  rMultiple: number | null;
  setup: string | null;
  tags: string[];
  notes: string;
  createdAt: number;
}

export interface DistributionBucket {
  bucket: string;
  centerR: number;
  count: number;
}

export interface EquityPoint {
  idx: number;
  cumR: number;
  cumDollars: number;
}

export interface JournalStats {
  count: number;
  winners: number;
  losers: number;
  scratches: number;
  winRate: number;
  avgWin: number;
  avgLoss: number;
  profitFactor: number;
  expectancy: number;
  totalR: number;
  totalDollars: number;
  maxDrawdown: number;
  maxDrawdownDollars: number;
  equityCurve: EquityPoint[];
  rDistribution: DistributionBucket[];
}

const KEY = "nqdesk.journal.v1";

export function loadTrades(): Trade[] {
  if (typeof localStorage === "undefined") return [];
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as Trade[]) : [];
  } catch {
    return [];
  }
}

export function saveTrades(trades: Trade[]): void {
  if (typeof localStorage === "undefined") return;
  try {
    localStorage.setItem(KEY, JSON.stringify(trades));
  } catch {
    /* best-effort */
  }
}

export function newTrade(
  partial: Partial<Trade> & {
    symbol: string;
    side: Side;
    entry: number;
    contracts: number;
  },
): Trade {
  const base: Trade = {
    id: nanoid(),
    symbol: partial.symbol,
    side: partial.side,
    entryTime: partial.entryTime ?? Date.now(),
    exitTime: partial.exitTime ?? null,
    entry: partial.entry,
    exit: partial.exit ?? null,
    contracts: partial.contracts,
    stopLoss: partial.stopLoss ?? null,
    takeProfit: partial.takeProfit ?? null,
    pointValue: POINT_VALUES[partial.symbol] ?? 1,
    pnlPoints: null,
    pnlDollars: null,
    rMultiple: null,
    setup: partial.setup ?? null,
    tags: partial.tags ?? [],
    notes: partial.notes ?? "",
    createdAt: Date.now(),
  };
  return recompute(base);
}

export function recompute(t: Trade): Trade {
  if (t.exit == null) {
    return { ...t, pnlPoints: null, pnlDollars: null, rMultiple: null };
  }
  const dir = t.side === "long" ? 1 : -1;
  const pnlPoints = (t.exit - t.entry) * dir;
  const pnlDollars = pnlPoints * t.pointValue * t.contracts;
  let rMultiple: number | null = null;
  if (t.stopLoss != null) {
    const risk = Math.abs(t.entry - t.stopLoss);
    if (risk > 0) rMultiple = pnlPoints / risk;
  }
  return { ...t, pnlPoints, pnlDollars, rMultiple };
}

const BUCKETS: { label: string; centerR: number; lo: number; hi: number }[] = [
  { label: "<-2", centerR: -2.5, lo: -Infinity, hi: -2 },
  { label: "-2",  centerR: -1.75, lo: -2,    hi: -1.5 },
  { label: "-1.5", centerR: -1.25, lo: -1.5, hi: -1 },
  { label: "-1", centerR: -0.75, lo: -1, hi: -0.5 },
  { label: "-0.5", centerR: -0.25, lo: -0.5, hi: 0 },
  { label: "0",  centerR: 0.25, lo: 0, hi: 0.5 },
  { label: "0.5", centerR: 0.75, lo: 0.5, hi: 1 },
  { label: "1", centerR: 1.25, lo: 1, hi: 1.5 },
  { label: "1.5", centerR: 1.75, lo: 1.5, hi: 2 },
  { label: "2", centerR: 2.25, lo: 2, hi: 2.5 },
  { label: ">2", centerR: 2.75, lo: 2.5, hi: Infinity },
];

function emptyDistribution(): DistributionBucket[] {
  return BUCKETS.map((b) => ({ bucket: b.label, centerR: b.centerR, count: 0 }));
}

function zeroStats(): JournalStats {
  return {
    count: 0,
    winners: 0,
    losers: 0,
    scratches: 0,
    winRate: 0,
    avgWin: 0,
    avgLoss: 0,
    profitFactor: 0,
    expectancy: 0,
    totalR: 0,
    totalDollars: 0,
    maxDrawdown: 0,
    maxDrawdownDollars: 0,
    equityCurve: [],
    rDistribution: emptyDistribution(),
  };
}

export function computeStats(trades: Trade[]): JournalStats {
  const closed = trades
    .filter((t) => t.exit != null && t.rMultiple != null)
    .sort((a, b) => a.entryTime - b.entryTime);

  if (closed.length === 0) return zeroStats();

  let winners = 0;
  let losers = 0;
  let scratches = 0;
  let sumWinR = 0;
  let sumLossR = 0;
  let totalR = 0;
  let totalDollars = 0;

  for (const t of closed) {
    const r = t.rMultiple as number;
    const d = t.pnlDollars ?? 0;
    totalR += r;
    totalDollars += d;
    if (r > 0.05) {
      winners++;
      sumWinR += r;
    } else if (r < -0.05) {
      losers++;
      sumLossR += Math.abs(r);
    } else {
      scratches++;
    }
  }

  const decisive = winners + losers;
  const winRate = decisive > 0 ? winners / decisive : 0;
  const avgWin = winners > 0 ? sumWinR / winners : 0;
  const avgLoss = losers > 0 ? sumLossR / losers : 0;
  const profitFactor =
    sumLossR > 0 ? sumWinR / sumLossR : sumWinR > 0 ? Infinity : 0;
  const expectancy = winRate * avgWin - (1 - winRate) * avgLoss;

  const equityCurve: EquityPoint[] = [];
  let cumR = 0;
  let cumDollars = 0;
  let peakR = 0;
  let peakDollars = 0;
  let maxDrawdown = 0;
  let maxDrawdownDollars = 0;
  for (let i = 0; i < closed.length; i++) {
    cumR += closed[i].rMultiple as number;
    cumDollars += closed[i].pnlDollars ?? 0;
    if (cumR > peakR) peakR = cumR;
    if (cumDollars > peakDollars) peakDollars = cumDollars;
    const dd = peakR - cumR;
    const ddD = peakDollars - cumDollars;
    if (dd > maxDrawdown) maxDrawdown = dd;
    if (ddD > maxDrawdownDollars) maxDrawdownDollars = ddD;
    equityCurve.push({ idx: i + 1, cumR, cumDollars });
  }

  const distCounts: Record<string, number> = {};
  for (const b of BUCKETS) distCounts[b.label] = 0;
  for (const t of closed) {
    const r = t.rMultiple as number;
    for (const b of BUCKETS) {
      if (r >= b.lo && r < b.hi) {
        distCounts[b.label]++;
        break;
      }
    }
  }
  const rDistribution: DistributionBucket[] = BUCKETS.map((b) => ({
    bucket: b.label,
    centerR: b.centerR,
    count: distCounts[b.label],
  }));

  return {
    count: closed.length,
    winners,
    losers,
    scratches,
    winRate,
    avgWin,
    avgLoss,
    profitFactor,
    expectancy,
    totalR,
    totalDollars,
    maxDrawdown,
    maxDrawdownDollars,
    equityCurve,
    rDistribution,
  };
}
