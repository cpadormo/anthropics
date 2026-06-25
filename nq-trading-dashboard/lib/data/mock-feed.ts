import { INSTRUMENTS } from "../instruments";
import type { Quote, RthSessionStats, SessionLevels } from "../types";
import type { DataProvider, Unsubscribe } from "./provider";

// Deterministic-seeded geometric Brownian motion per instrument.
// Same calendar day + same symbol => same opening series, so refreshes
// don't reshuffle the dashboard mid-session.

function mulberry32(seed: number) {
  return function () {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function hashSymbol(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function dayOfYear(d = new Date()): number {
  const start = new Date(d.getFullYear(), 0, 0);
  return Math.floor((d.getTime() - start.getTime()) / 86_400_000);
}

function boxMullerNormal(rnd: () => number): number {
  const u1 = Math.max(rnd(), 1e-9);
  const u2 = rnd();
  return Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
}

interface State {
  quote: Quote;
  listeners: Set<(q: Quote) => void>;
  sigmaPerTick: number;
  levels: SessionLevels;
  stats: RthSessionStats;
}

const TICK_MS = 750;
const SERIES_LEN = 60;

export class MockDataProvider implements DataProvider {
  private states = new Map<string, State>();
  private interval: ReturnType<typeof setInterval> | null = null;
  private rnd: () => number;

  constructor() {
    this.rnd = mulberry32(Date.now() & 0xffffffff);
    for (const sym of Object.keys(INSTRUMENTS)) {
      this.states.set(sym, this.initState(sym));
    }
    if (typeof window !== "undefined") this.start();
  }

  private initState(symbol: string): State {
    const inst = INSTRUMENTS[symbol];
    const seed = hashSymbol(symbol) ^ dayOfYear();
    const rnd = mulberry32(seed);

    // Approximate ticks per trading year so annualVol maps to per-tick sigma.
    const ticksPerYear = (252 * 6.5 * 3600) / (TICK_MS / 1000);
    const sigmaPerTick = inst.annualVol / Math.sqrt(ticksPerYear);

    const prevClose = inst.basePrice * (1 + (rnd() - 0.5) * 0.005);
    let p = prevClose * (1 + (rnd() - 0.5) * 0.004);
    const series: number[] = [];
    for (let i = 0; i < SERIES_LEN; i++) {
      p = p * Math.exp(sigmaPerTick * boxMullerNormal(rnd));
      series.push(p);
    }
    const last = series[series.length - 1];
    const change = last - prevClose;
    const quote: Quote = {
      symbol,
      last,
      change,
      changePct: (change / prevClose) * 100,
      prevClose,
      ts: Date.now(),
      series,
    };

    const levels = this.synthLevels(symbol, prevClose, last, rnd);
    const stats = this.synthStats(symbol, prevClose, series, rnd);
    return { quote, listeners: new Set(), sigmaPerTick, levels, stats };
  }

  private synthLevels(
    symbol: string,
    prevClose: number,
    last: number,
    rnd: () => number,
  ): SessionLevels {
    const range = prevClose * (0.004 + rnd() * 0.006);
    const wkRange = prevClose * (0.012 + rnd() * 0.014);
    const moRange = prevClose * (0.04 + rnd() * 0.05);
    const prevDayHigh = prevClose + range * (0.5 + rnd() * 0.4);
    const prevDayLow = prevClose - range * (0.5 + rnd() * 0.4);
    const asiaHigh = prevClose + range * (0.2 + rnd() * 0.3);
    const asiaLow = prevClose - range * (0.2 + rnd() * 0.3);
    const londonHigh = Math.max(asiaHigh, last + range * 0.1);
    const londonLow = Math.min(asiaLow, last - range * 0.1);
    const overnightHigh = Math.max(asiaHigh, londonHigh, last);
    const overnightLow = Math.min(asiaLow, londonLow, last);
    const gapPoints = last - prevClose;
    return {
      symbol,
      asiaHigh,
      asiaLow,
      londonHigh,
      londonLow,
      overnightHigh,
      overnightLow,
      prevDayHigh,
      prevDayLow,
      prevDayClose: prevClose,
      prevWeekHigh: prevClose + wkRange * 0.6,
      prevWeekLow: prevClose - wkRange * 0.6,
      prevMonthHigh: prevClose + moRange * 0.6,
      prevMonthLow: prevClose - moRange * 0.6,
      gapPoints,
      gapPct: (gapPoints / prevClose) * 100,
    };
  }

  private synthStats(
    symbol: string,
    prevClose: number,
    series: number[],
    rnd: () => number,
  ): RthSessionStats {
    const high = Math.max(...series);
    const low = Math.min(...series);
    const range = high - low;
    const avgRange = prevClose * (0.008 + rnd() * 0.006);
    const ibHigh = high - range * 0.2 * rnd();
    const ibLow = low + range * 0.2 * rnd();
    const openingPrint = series[0];
    const last = series[series.length - 1];
    const momentumScore = Math.tanh(((last - openingPrint) / (range || 1)) * 2);
    return {
      symbol,
      high,
      low,
      range,
      avgRange,
      rangeExpansionPct: (range / avgRange - 1) * 100,
      ibHigh,
      ibLow,
      ibRange: ibHigh - ibLow,
      openingPrint,
      momentumScore,
    };
  }

  private start() {
    if (this.interval) return;
    this.interval = setInterval(() => {
      for (const st of this.states.values()) {
        const next = st.quote.last * Math.exp(st.sigmaPerTick * boxMullerNormal(this.rnd));
        const change = next - st.quote.prevClose;
        const series = st.quote.series.slice(1);
        series.push(next);
        st.quote = {
          ...st.quote,
          last: next,
          change,
          changePct: (change / st.quote.prevClose) * 100,
          series,
          ts: Date.now(),
        };
        if (next > st.stats.high) {
          st.stats = { ...st.stats, high: next, range: next - st.stats.low };
        }
        if (next < st.stats.low) {
          st.stats = { ...st.stats, low: next, range: st.stats.high - next };
        }
        for (const cb of st.listeners) cb(st.quote);
      }
    }, TICK_MS);
  }

  subscribe(symbol: string, onTick: (q: Quote) => void): Unsubscribe {
    const st = this.states.get(symbol);
    if (!st) return () => {};
    st.listeners.add(onTick);
    queueMicrotask(() => onTick(st.quote));
    return () => {
      st.listeners.delete(onTick);
    };
  }

  snapshot(symbol: string): Quote | null {
    return this.states.get(symbol)?.quote ?? null;
  }

  sessionLevels(symbol: string): SessionLevels | null {
    return this.states.get(symbol)?.levels ?? null;
  }

  rthStats(symbol: string): RthSessionStats | null {
    return this.states.get(symbol)?.stats ?? null;
  }
}

let _provider: MockDataProvider | null = null;
export function getProvider(): MockDataProvider {
  if (!_provider) _provider = new MockDataProvider();
  return _provider;
}
