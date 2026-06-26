import type { Candle, Quote, RthSessionStats, SessionLevels, Timeframe } from "../types";

export type Unsubscribe = () => void;

// Single interface that every concrete data feed implements.
// V1 / V2A ship MockDataProvider; V2B adds real adapters
// (Databento, Polygon, Tradovate, IBKR) behind the same contract
// so widgets never change.
export interface DataProvider {
  subscribe(symbol: string, onTick: (q: Quote) => void): Unsubscribe;
  snapshot(symbol: string): Quote | null;
  sessionLevels(symbol: string): SessionLevels | null;
  rthStats(symbol: string): RthSessionStats | null;
  candles(symbol: string, timeframe: Timeframe, count?: number): Candle[] | null;
}
