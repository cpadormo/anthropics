"use client";

import { useMemo } from "react";
import { useCandles } from "./use-candles";
import { pairwiseCorrelations, type CorrelationCell } from "../data/correlations";
import type { Candle } from "../types";

const SYMBOLS = [
  "NQ", "ES", "RTY", "YM", "VIX", "DXY", "US10Y", "GC", "CL", "BTC",
];

// Hooks must be called unconditionally and in fixed order — we unroll the
// useCandles calls instead of looping.
export function useCorrelations(): { symbols: string[]; cells: CorrelationCell[] } {
  const nq    = useCandles("NQ",    "5m", 60);
  const es    = useCandles("ES",    "5m", 60);
  const rty   = useCandles("RTY",   "5m", 60);
  const ym    = useCandles("YM",    "5m", 60);
  const vix   = useCandles("VIX",   "5m", 60);
  const dxy   = useCandles("DXY",   "5m", 60);
  const us10y = useCandles("US10Y", "5m", 60);
  const gc    = useCandles("GC",    "5m", 60);
  const cl    = useCandles("CL",    "5m", 60);
  const btc   = useCandles("BTC",   "5m", 60);

  return useMemo(() => {
    const map: Record<string, Candle[] | null> = {
      NQ: nq, ES: es, RTY: rty, YM: ym, VIX: vix,
      DXY: dxy, US10Y: us10y, GC: gc, CL: cl, BTC: btc,
    };
    const series: Record<string, Candle[]> = {};
    for (const [k, v] of Object.entries(map)) {
      if (v && v.length >= 5) series[k] = v;
    }
    if (Object.keys(series).length < 2) return { symbols: SYMBOLS, cells: [] };
    return { symbols: SYMBOLS, cells: pairwiseCorrelations(series) };
  }, [nq, es, rty, ym, vix, dxy, us10y, gc, cl, btc]);
}
