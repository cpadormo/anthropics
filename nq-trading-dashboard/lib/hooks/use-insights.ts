"use client";

import { useMemo } from "react";
import { useCandles } from "./use-candles";
import { useQuote } from "./use-quotes";
import { useRthStats, useSessionLevels } from "./use-session-levels";
import { detectInsights, type Insight } from "../data/insights";

export function useInsights(symbol: string): Insight[] {
  const intraday = useCandles(symbol, "1m", 400);
  const daily = useCandles(symbol, "D", 60);
  const rthStats = useRthStats(symbol);
  const sessionLevels = useSessionLevels(symbol);
  const vix = useQuote("VIX");
  return useMemo(() => {
    if (!intraday || !daily) return [];
    return detectInsights({
      intraday1m: intraday,
      dailyBars: daily,
      rthStats,
      sessionLevels,
      vixChangePct: vix?.changePct ?? 0,
    });
  }, [intraday, daily, rthStats, sessionLevels, vix?.changePct]);
}
