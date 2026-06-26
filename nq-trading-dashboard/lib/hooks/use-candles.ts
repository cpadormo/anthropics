"use client";

import { useEffect, useState } from "react";
import { getProvider } from "../data/provider-factory";
import type { Candle, Timeframe } from "../types";

export function useCandles(
  symbol: string,
  timeframe: Timeframe,
  count = 200,
): Candle[] | null {
  const [bars, setBars] = useState<Candle[] | null>(null);
  useEffect(() => {
    setBars(getProvider().candles(symbol, timeframe, count));
  }, [symbol, timeframe, count]);
  return bars;
}
