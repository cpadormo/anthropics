"use client";

import { useState } from "react";
import { GlassCard } from "../ui/glass-card";
import { StatTile } from "../ui/stat-tile";
import { INSTRUMENTS } from "@/lib/instruments";
import { useQuote } from "@/lib/hooks/use-quotes";
import { useRthStats } from "@/lib/hooks/use-session-levels";
import { cn, fmtPct, fmtPrice } from "@/lib/utils";

const SYMBOL_OPTIONS = ["NQ", "ES", "RTY", "YM"];

export function SessionStats() {
  const [symbol, setSymbol] = useState("NQ");
  const inst = INSTRUMENTS[symbol];
  const quote = useQuote(symbol);
  const stats = useRthStats(symbol);
  const dec = inst.priceDecimals;

  return (
    <GlassCard
      title="Session Statistics"
      subtitle={inst.name}
      actions={
        <div className="flex gap-0.5 rounded-md bg-white/[0.04] p-0.5">
          {SYMBOL_OPTIONS.map((s) => (
            <button
              key={s}
              onClick={() => setSymbol(s)}
              className={cn(
                "px-2 py-0.5 text-2xs font-medium rounded",
                symbol === s
                  ? "bg-white/10 text-text-primary"
                  : "text-text-muted hover:text-text-secondary",
              )}
            >
              {s}
            </button>
          ))}
        </div>
      }
    >
      {!stats || !quote ? (
        <div className="text-text-muted text-sm">Loading…</div>
      ) : (
        <SessionStatsBody quote={quote} stats={stats} dec={dec} />
      )}
    </GlassCard>
  );
}

function SessionStatsBody({
  quote,
  stats,
  dec,
}: {
  quote: { last: number };
  stats: import("@/lib/types").RthSessionStats;
  dec: number;
}) {
  const inIB = quote.last >= stats.ibLow && quote.last <= stats.ibHigh;
  const momentumTone =
    stats.momentumScore > 0.2 ? "bull" : stats.momentumScore < -0.2 ? "bear" : "default";
  const ibStatus = inIB ? "Inside IB" : quote.last > stats.ibHigh ? "Breakout ↑" : "Breakdown ↓";
  const ibTone = inIB ? "default" : quote.last > stats.ibHigh ? "bull" : "bear";

  return (
    <div className="grid grid-cols-2 gap-2">
      <StatTile label="Session High" value={fmtPrice(stats.high, dec)} />
      <StatTile label="Session Low" value={fmtPrice(stats.low, dec)} />
      <StatTile label="Range" value={fmtPrice(stats.range, dec)} />
      <StatTile label="Avg Range" value={fmtPrice(stats.avgRange, dec)} hint="20-day avg" />
      <StatTile
        label="Range Expansion"
        value={fmtPct(stats.rangeExpansionPct)}
        tone={stats.rangeExpansionPct > 0 ? "warn" : "default"}
      />
      <StatTile
        label="Momentum"
        value={stats.momentumScore.toFixed(2)}
        tone={momentumTone}
        hint={stats.momentumScore > 0 ? "Bull pressure" : "Bear pressure"}
      />
      <StatTile label="IB High" value={fmtPrice(stats.ibHigh, dec)} tone="info" />
      <StatTile label="IB Low" value={fmtPrice(stats.ibLow, dec)} tone="info" />
      <StatTile label="IB Status" value={ibStatus} tone={ibTone} />
      <StatTile label="Opening Print" value={fmtPrice(stats.openingPrint, dec)} />
    </div>
  );
}
