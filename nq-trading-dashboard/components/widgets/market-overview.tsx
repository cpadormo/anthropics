"use client";

import { GlassCard } from "../ui/glass-card";
import { PriceCell } from "../ui/price-cell";
import { INSTRUMENTS, OVERVIEW_SYMBOLS } from "@/lib/instruments";
import { useQuotes } from "@/lib/hooks/use-quotes";

export function MarketOverview() {
  const quotes = useQuotes(OVERVIEW_SYMBOLS);
  return (
    <GlassCard title="Market Overview" subtitle="Cross-asset risk dashboard">
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-2">
        {OVERVIEW_SYMBOLS.map((s) => (
          <PriceCell key={s} quote={quotes[s]} instrument={INSTRUMENTS[s]} />
        ))}
      </div>
    </GlassCard>
  );
}
