"use client";

import { useMemo } from "react";
import { GlassCard } from "../ui/glass-card";
import { useCandles } from "@/lib/hooks/use-candles";
import { trendFromEMA } from "@/lib/indicators";
import { INSTRUMENTS } from "@/lib/instruments";
import type { Timeframe } from "@/lib/types";
import { cn } from "@/lib/utils";

const SYMBOLS = ["NQ", "ES", "RTY", "YM"];
const TFS: Timeframe[] = ["1m", "5m", "15m", "1H", "4H", "D"];

export function MultiTimeframeTrend() {
  return (
    <GlassCard title="Multi-Timeframe Trend" subtitle="EMA(20) vs EMA(50) spread">
      <div
        className="grid gap-y-0.5"
        style={{ gridTemplateColumns: `56px repeat(${TFS.length}, minmax(0,1fr))` }}
      >
        <div />
        {TFS.map((tf) => (
          <div
            key={tf}
            className="text-center text-2xs uppercase tracking-[0.12em] text-text-muted py-1"
          >
            {tf}
          </div>
        ))}
        {SYMBOLS.map((sym) => (
          <SymbolRow key={sym} symbol={sym} />
        ))}
      </div>
      <Legend />
    </GlassCard>
  );
}

function SymbolRow({ symbol }: { symbol: string }) {
  return (
    <>
      <div className="flex items-center font-mono text-xs text-text-primary py-1.5 pr-2">
        {INSTRUMENTS[symbol].display}
      </div>
      {TFS.map((tf) => (
        <TrendCell key={tf} symbol={symbol} tf={tf} />
      ))}
    </>
  );
}

function TrendCell({ symbol, tf }: { symbol: string; tf: Timeframe }) {
  const candles = useCandles(symbol, tf, 100);
  const trend = useMemo(() => {
    if (!candles) return null;
    return trendFromEMA(
      candles.map((c) => c.close),
      20,
      50,
    );
  }, [candles]);

  if (!trend) {
    return <div className="m-0.5 h-7 rounded-md bg-white/[0.02] animate-pulseSoft" />;
  }

  const tone =
    trend.direction === "bull"
      ? "bg-bull/20 text-bull border-bull/30"
      : trend.direction === "bear"
        ? "bg-bear/20 text-bear border-bear/30"
        : "bg-white/[0.03] text-text-muted border-white/5";
  const arrow = trend.direction === "bull" ? "↑" : trend.direction === "bear" ? "↓" : "·";

  return (
    <div
      className={cn(
        "m-0.5 h-7 rounded-md grid place-items-center text-xs font-mono border",
        tone,
      )}
      title={`${trend.direction} · spread ${(trend.spread * 100).toFixed(2)}% · strength ${(trend.strength * 100).toFixed(0)}`}
    >
      <span>
        {arrow} {(trend.strength * 100).toFixed(0)}
      </span>
    </div>
  );
}

function Legend() {
  return (
    <div className="mt-3 flex items-center gap-3 text-2xs text-text-muted">
      <LegendDot tone="bull" label="Bull (EMA20 > EMA50)" />
      <LegendDot tone="bear" label="Bear (EMA20 < EMA50)" />
      <LegendDot tone="neutral" label="Neutral" />
      <span className="ml-auto">Cell value = strength (0–100)</span>
    </div>
  );
}

function LegendDot({
  tone,
  label,
}: {
  tone: "bull" | "bear" | "neutral";
  label: string;
}) {
  const color =
    tone === "bull" ? "bg-bull/60" : tone === "bear" ? "bg-bear/60" : "bg-white/20";
  return (
    <span className="flex items-center gap-1">
      <span className={cn("w-2 h-2 rounded-sm", color)} />
      <span>{label}</span>
    </span>
  );
}
