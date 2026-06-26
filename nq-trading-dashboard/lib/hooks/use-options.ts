"use client";

import { useEffect, useMemo, useState } from "react";
import { synthesizeOptions, type OptionsSummary } from "../data/options";
import { useQuote } from "./use-quotes";

interface OptionsState {
  summary: OptionsSummary | null;
  demo: boolean;
}

export function useOptions(symbol: string): OptionsState {
  const quote = useQuote(symbol);
  const vix = useQuote("VIX");
  const [server, setServer] = useState<Partial<OptionsSummary> | null>(null);
  const [serverDemo, setServerDemo] = useState<boolean>(true);

  useEffect(() => {
    let active = true;
    async function load() {
      try {
        const res = await fetch(
          `/api/options?symbol=${encodeURIComponent(symbol)}`,
          { cache: "no-store" },
        );
        if (!res.ok) return;
        const data = await res.json();
        if (!active) return;
        if (data?.summary && !data.demo) {
          setServer(data.summary as Partial<OptionsSummary>);
          setServerDemo(false);
        } else {
          setServer(null);
          setServerDemo(true);
        }
      } catch {
        if (active) setServerDemo(true);
      }
    }
    load();
    const id = setInterval(load, 60_000);
    return () => {
      active = false;
      clearInterval(id);
    };
  }, [symbol]);

  const summary = useMemo<OptionsSummary | null>(() => {
    if (!quote || !vix) return null;
    const base = synthesizeOptions(symbol, quote.last, vix.last);
    // Merge server-provided real fields over the synthesized baseline so any
    // missing UW field falls back to a sensible computed value.
    if (!server) return base;
    return {
      ...base,
      ...server,
      symbol: base.symbol,
      spot: base.spot,
      expectedMove1d: base.expectedMove1d,
      expectedMove1w: base.expectedMove1w,
    };
  }, [server, symbol, quote?.last, vix?.last]);

  return { summary, demo: serverDemo };
}
