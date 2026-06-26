import { INSTRUMENTS } from "../instruments";
import type {
  Candle,
  Quote,
  RthSessionStats,
  SessionLevels,
  Timeframe,
} from "../types";
import { MockDataProvider } from "./mock-feed";
import type { DataProvider, ProviderStatus, Unsubscribe } from "./provider";
import { frontMonth } from "./symbols";
import { TradovateClient } from "./tradovate-client";

const TRADOVATE_ROOTS = new Set(["NQ", "ES", "RTY", "YM"]);
const SERIES_LEN = 60;

export class TradovateProvider implements DataProvider {
  private client: TradovateClient;
  private fallback: MockDataProvider;
  private series = new Map<string, number[]>();
  private prevClose = new Map<string, number>();
  private rootToContract = new Map<string, string>();
  private _status: ProviderStatus = { name: "tradovate", state: "connecting" };
  private statusListeners = new Set<(s: ProviderStatus) => void>();
  private authError = false;

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

  // TODO V2B-3: derive from Tradovate historical bars.
  sessionLevels(symbol: string): SessionLevels | null {
    return this.fallback.sessionLevels(symbol);
  }

  // TODO V2B-3: derive from Tradovate historical bars.
  rthStats(symbol: string): RthSessionStats | null {
    return this.fallback.rthStats(symbol);
  }

  // TODO V2B-3: implement md/getChart subscription.
  candles(symbol: string, timeframe: Timeframe, count = 200): Candle[] | null {
    if (!INSTRUMENTS[symbol]) return null;
    return this.fallback.candles(symbol, timeframe, count);
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
}
