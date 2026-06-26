"use client";

import { useMemo } from "react";
import { useCandles } from "./use-candles";
import { computeStats, type JournalStats } from "../data/journal";
import { runBacktest, toJournalTrades, type BacktestTrade } from "../backtest/engine";
import { STRATEGIES, type StrategyId } from "../backtest/strategies";
import type { Timeframe } from "../types";

const POINT_VALUES: Record<string, number> = {
  NQ: 20, ES: 50, RTY: 50, YM: 5,
};

export interface BacktestRequest {
  strategyId: StrategyId;
  params: unknown;
  symbol: string;
  timeframe: Timeframe;
  count: number;
}

export interface BacktestRun {
  trades: BacktestTrade[];
  stats: JournalStats;
  barsLoaded: number;
}

export function useBacktest(req: BacktestRequest): BacktestRun | null {
  const bars = useCandles(req.symbol, req.timeframe, req.count);
  return useMemo(() => {
    if (!bars || bars.length < 30) return null;
    const strategy = STRATEGIES[req.strategyId];
    const params = (req.params ?? strategy.defaults) as any;
    const trades = runBacktest(bars, strategy as any, params);
    const pointValue = POINT_VALUES[req.symbol] ?? 1;
    const journalTrades = toJournalTrades(trades, req.symbol, pointValue, bars);
    const stats = computeStats(journalTrades);
    return { trades, stats, barsLoaded: bars.length };
  }, [bars, req.strategyId, req.params, req.symbol, req.timeframe, req.count]);
}
