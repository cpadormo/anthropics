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
    const provider = getProvider();
    setBars(provider.candles(symbol, timeframe, count));
    // If the provider supports live candle updates (Tradovate), subscribe.
    // Mock has no live updates so we just keep the initial snapshot.
    return provider.onCandlesChange?.(symbol, timeframe, count, setBars);
  }, [symbol, timeframe, count]);
  return bars;
}
