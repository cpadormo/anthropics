import type { Candle, Quote, RthSessionStats, SessionLevels, Timeframe } from "../types";

export type Unsubscribe = () => void;

export interface ProviderStatus {
  name: "mock" | "tradovate";
  state: "ok" | "connecting" | "error";
  detail?: string;
}

// Single interface that every concrete data feed implements.
// V1 / V2A ship MockDataProvider; V2B-1 adds Tradovate. V2B-3 will
// extend with md/getChart for real candles. Widgets never depend on
// the concrete implementation.
export interface DataProvider {
  subscribe(symbol: string, onTick: (q: Quote) => void): Unsubscribe;
  snapshot(symbol: string): Quote | null;
  sessionLevels(symbol: string): SessionLevels | null;
  rthStats(symbol: string): RthSessionStats | null;
  candles(symbol: string, timeframe: Timeframe, count?: number): Candle[] | null;
  status(): ProviderStatus;
  onStatusChange?(cb: (s: ProviderStatus) => void): Unsubscribe;
}
