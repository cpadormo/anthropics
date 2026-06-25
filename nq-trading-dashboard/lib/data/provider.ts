import type { Quote, RthSessionStats, SessionLevels } from "../types";

export type Unsubscribe = () => void;

// Single interface that every concrete data feed implements.
// V1 ships MockDataProvider; V2 will add real adapters (Databento, Polygon,
// Tradovate, IBKR) behind the same contract so widgets never change.
export interface DataProvider {
  subscribe(symbol: string, onTick: (q: Quote) => void): Unsubscribe;
  snapshot(symbol: string): Quote | null;
  sessionLevels(symbol: string): SessionLevels | null;
  rthStats(symbol: string): RthSessionStats | null;
}
