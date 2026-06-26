"use client";

import { useMemo } from "react";
import { synthesizeOptions, type OptionsSummary } from "../data/options";
import { useQuote } from "./use-quotes";

export function useOptions(symbol: string): OptionsSummary | null {
  const quote = useQuote(symbol);
  const vix = useQuote("VIX");
  return useMemo(() => {
    if (!quote || !vix) return null;
    return synthesizeOptions(symbol, quote.last, vix.last);
  }, [symbol, quote?.last, vix?.last]);
}
