import { INSTRUMENTS } from "../instruments";
import type {
  Candle,
  Quote,
  RthSessionStats,
  SessionLevels,
  Timeframe,
} from "../types";
import { deriveRthStats, deriveSessionLevels } from "./derive";
import { MockDataProvider } from "./mock-feed";
import type { DataProvider, ProviderStatus, Unsubscribe } from "./provider";
import { frontMonth } from "./symbols";
import { TradovateClient } from "./tradovate-client";

const TRADOVATE_ROOTS = new Set(["NQ", "ES", "RTY", "YM"]);
const SERIES_LEN = 60;

// Bars per derivation: ~1500 × 1m covers a full overnight + RTH; 60 × D
// covers a quarter for prev-week / prev-month levels and 20-day avg range.
const DERIVE_INTRADAY_COUNT = 1500;
const DERIVE_DAILY_COUNT = 60;

const TF_MAP: Record<
  Timeframe,
  { underlyingType: "MinuteBar" | "DailyBar"; elementSize: number }
> = {
  "1m":  { underlyingType: "MinuteBar", elementSize: 1 },
  "5m":  { underlyingType: "MinuteBar", elementSize: 5 },
  "15m": { underlyingType: "MinuteBar", elementSize: 15 },
  "1H":  { underlyingType: "MinuteBar", elementSize: 60 },
  "4H":  { underlyingType: "MinuteBar", elementSize: 240 },
  "D":   { underlyingType: "DailyBar",  elementSize: 1 },
};

function mergeBars(existing: Candle[], incoming: Candle[]): Candle[] {
  const map = new Map<number, Candle>();
  for (const x of existing) map.set(x.ts, x);
  // Incoming overwrites — the live realtime stream sends updated last-bar values.
  for (const x of incoming) map.set(x.ts, x);
  return [...map.values()].sort((a, b) => a.ts - b.ts);
}

export class TradovateProvider implements DataProvider {
  private client: TradovateClient;
  private fallback: MockDataProvider;
  private series = new Map<string, number[]>();
  private prevClose = new Map<string, number>();
  private rootToContract = new Map<string, string>();
  private _status: ProviderStatus = { name: "tradovate", state: "connecting" };
  private statusListeners = new Set<(s: ProviderStatus) => void>();
  private authError = false;

  // Chart subscription state per cache key (`symbol:tf:count`).
  private candleCache = new Map<string, Candle[]>();
  private candleListeners = new Map<string, Set<(bars: Candle[]) => void>>();
  private candleUnsub = new Map<string, Unsubscribe>();

  constructor() {
    this.client = new TradovateClient();
    this.fallback = new MockDataProvider();
    if (typeof window !== "undefined") {
      this.client
        .connect()
        .then(() => this.setStatus({ name: "tradovate", state: "ok" }))
        .catch((err) => {
          this.authError = true;
          const detail = err instanceof Error ? err.message : String(err);
          this.setStatus({ name: "tradovate", state: "error", detail });
          // eslint-disable-next-line no-console
          console.error(
            "[Tradovate] connect failed; dashboard running on mock feed:",
            err,
          );
        });
    }
  }

  private setStatus(s: ProviderStatus) {
    this._status = s;
    for (const cb of this.statusListeners) cb(s);
  }

  private contractFor(root: string): string {
    let c = this.rootToContract.get(root);
    if (!c) {
      c = frontMonth(root);
      this.rootToContract.set(root, c);
    }
    return c;
  }

  subscribe(symbol: string, onTick: (q: Quote) => void): Unsubscribe {
    if (this.authError || !TRADOVATE_ROOTS.has(symbol)) {
      return this.fallback.subscribe(symbol, onTick);
    }
    const contract = this.contractFor(symbol);
    return this.client.subscribe(contract, (tq) => {
      const last =
        tq.last ?? (tq.bid != null && tq.ask != null ? (tq.bid + tq.ask) / 2 : null);
      if (last == null) return;
      const prev = this.prevClose.get(symbol) ?? tq.settlement ?? last;
      if (!this.prevClose.has(symbol)) this.prevClose.set(symbol, prev);
      let series = this.series.get(symbol);
      if (!series) {
        series = new Array(SERIES_LEN).fill(last);
        this.series.set(symbol, series);
      } else {
        series.shift();
        series.push(last);
      }
      const change = last - prev;
      onTick({
        symbol,
        last,
        change,
        changePct: prev ? (change / prev) * 100 : 0,
        prevClose: prev,
        ts: tq.ts,
        series: series.slice(),
      });
    });
  }

  snapshot(symbol: string): Quote | null {
    if (this.authError || !TRADOVATE_ROOTS.has(symbol)) {
      return this.fallback.snapshot(symbol);
    }
    const tq = this.client.latestQuote(this.contractFor(symbol));
    if (!tq) return null;
    const last =
      tq.last ?? (tq.bid != null && tq.ask != null ? (tq.bid + tq.ask) / 2 : 0);
    const prev = this.prevClose.get(symbol) ?? tq.settlement ?? last;
    return {
      symbol,
      last,
      change: last - prev,
      changePct: prev ? ((last - prev) / prev) * 100 : 0,
      prevClose: prev,
      ts: tq.ts,
      series: this.series.get(symbol)?.slice() ?? [last],
    };
  }

  sessionLevels(symbol: string): SessionLevels | null {
    if (this.authError || !TRADOVATE_ROOTS.has(symbol)) {
      return this.fallback.sessionLevels(symbol);
    }
    // Request derivation inputs — these auto-start chart subscriptions on first call.
    const intraday = this.candles(symbol, "1m", DERIVE_INTRADAY_COUNT);
    const daily = this.candles(symbol, "D", DERIVE_DAILY_COUNT);
    if (!intraday || !daily) return this.fallback.sessionLevels(symbol);
    const derived = deriveSessionLevels(symbol, intraday, daily);
    return derived ?? this.fallback.sessionLevels(symbol);
  }

  rthStats(symbol: string): RthSessionStats | null {
    if (this.authError || !TRADOVATE_ROOTS.has(symbol)) {
      return this.fallback.rthStats(symbol);
    }
    const intraday = this.candles(symbol, "1m", DERIVE_INTRADAY_COUNT);
    const daily = this.candles(symbol, "D", DERIVE_DAILY_COUNT);
    if (!intraday || !daily) return this.fallback.rthStats(symbol);
    const derived = deriveRthStats(symbol, intraday, daily);
    return derived ?? this.fallback.rthStats(symbol);
  }

  candles(symbol: string, timeframe: Timeframe, count = 200): Candle[] | null {
    if (this.authError || !TRADOVATE_ROOTS.has(symbol)) {
      return this.fallback.candles(symbol, timeframe, count);
    }
    const key = this.candleKey(symbol, timeframe, count);
    const cached = this.candleCache.get(key);
    if (!this.candleUnsub.has(key)) this.startCandleSubscription(symbol, timeframe, count, key);
    if (cached && cached.length) return cached;
    // While the first batch is in flight, give the widget mock data so the UI isn't blank.
    return this.fallback.candles(symbol, timeframe, count);
  }

  onCandlesChange(
    symbol: string,
    timeframe: Timeframe,
    count: number,
    cb: (bars: Candle[]) => void,
  ): Unsubscribe {
    if (this.authError || !TRADOVATE_ROOTS.has(symbol)) {
      const bars = this.fallback.candles(symbol, timeframe, count);
      if (bars) queueMicrotask(() => cb(bars));
      return () => {};
    }
    const key = this.candleKey(symbol, timeframe, count);
    let set = this.candleListeners.get(key);
    if (!set) {
      set = new Set();
      this.candleListeners.set(key, set);
    }
    set.add(cb);
    if (!this.candleUnsub.has(key)) this.startCandleSubscription(symbol, timeframe, count, key);
    const cached = this.candleCache.get(key);
    if (cached && cached.length) queueMicrotask(() => cb(cached));
    return () => {
      set!.delete(cb);
    };
  }

  status(): ProviderStatus {
    return this._status;
  }

  onStatusChange(cb: (s: ProviderStatus) => void): Unsubscribe {
    this.statusListeners.add(cb);
    queueMicrotask(() => cb(this._status));
    return () => {
      this.statusListeners.delete(cb);
    };
  }

  private candleKey(symbol: string, tf: Timeframe, count: number): string {
    return `${symbol}:${tf}:${count}`;
  }

  private startCandleSubscription(
    symbol: string,
    tf: Timeframe,
    count: number,
    key: string,
  ) {
    const cfg = TF_MAP[tf];
    const unsub = this.client.subscribeChart(
      {
        symbol: this.contractFor(symbol),
        underlyingType: cfg.underlyingType,
        elementSize: cfg.elementSize,
        count,
      },
      (bars) => {
        const merged = mergeBars(this.candleCache.get(key) ?? [], bars).slice(-count);
        this.candleCache.set(key, merged);
        const set = this.candleListeners.get(key);
        if (set) for (const cb of set) cb(merged);
      },
    );
    this.candleUnsub.set(key, unsub);
  }
}
