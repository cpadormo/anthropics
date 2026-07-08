import type { Candle, Quote, RthSessionStats, SessionLevels, Timeframe } from "../types";

export type Unsubscribe = () => void;

export interface ProviderStatus {
  name: "mock" | "tradovate";
  state: "ok" | "connecting" | "error";
  detail?: string;
}

// Single interface that every concrete data feed implements.
// Widgets only ever talk to this surface.
export interface DataProvider {
  subscribe(symbol: string, onTick: (q: Quote) => void): Unsubscribe;
  snapshot(symbol: string): Quote | null;
  sessionLevels(symbol: string): SessionLevels | null;
  rthStats(symbol: string): RthSessionStats | null;
  candles(symbol: string, timeframe: Timeframe, count?: number): Candle[] | null;
  // Optional reactive variant. When present, useCandles uses it for live updates;
  // when absent (mock), the hook just keeps the initial snapshot.
  onCandlesChange?(
    symbol: string,
    timeframe: Timeframe,
    count: number,
    cb: (bars: Candle[]) => void,
  ): Unsubscribe;
  status(): ProviderStatus;
  onStatusChange?(cb: (s: ProviderStatus) => void): Unsubscribe;
}
