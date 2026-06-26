"use client";

import { useEffect, useState } from "react";
import { getProvider } from "../data/provider-factory";
import type { Quote } from "../types";

export function useQuote(symbol: string): Quote | null {
  const [quote, setQuote] = useState<Quote | null>(null);
  useEffect(() => {
    const provider = getProvider();
    setQuote(provider.snapshot(symbol));
    return provider.subscribe(symbol, setQuote);
  }, [symbol]);
  return quote;
}

export function useQuotes(symbols: string[]): Record<string, Quote | null> {
  const [quotes, setQuotes] = useState<Record<string, Quote | null>>(() => {
    const obj: Record<string, Quote | null> = {};
    for (const s of symbols) obj[s] = null;
    return obj;
  });

  const key = symbols.join(",");
  useEffect(() => {
    const provider = getProvider();
    const list = key.split(",").filter(Boolean);
    const unsubs = list.map((s) =>
      provider.subscribe(s, (q) =>
        setQuotes((prev) => (prev[s] === q ? prev : { ...prev, [s]: q })),
      ),
    );
    return () => {
      for (const u of unsubs) u();
    };
  }, [key]);

  return quotes;
}
