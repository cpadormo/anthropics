"use client";

import { useState } from "react";
import { GlassCard } from "../ui/glass-card";
import { StatTile } from "../ui/stat-tile";
import { INSTRUMENTS } from "@/lib/instruments";
import { useQuote } from "@/lib/hooks/use-quotes";
import { useSessionLevels } from "@/lib/hooks/use-session-levels";
import { cn, fmtPct, fmtPrice, fmtSigned } from "@/lib/utils";

const SYMBOL_OPTIONS = ["NQ", "ES", "RTY", "YM"];

export function OvernightSession() {
  const [symbol, setSymbol] = useState("NQ");
  const inst = INSTRUMENTS[symbol];
  const quote = useQuote(symbol);
  const lv = useSessionLevels(symbol);
  const dec = inst.priceDecimals;

  return (
    <GlassCard
      title="Overnight & Key Levels"
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
      {!lv || !quote ? (
        <div className="text-text-muted text-sm">Loading session levels…</div>
      ) : (
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-2">
            <StatTile
              label="Gap"
              value={fmtSigned(lv.gapPoints, dec)}
              tone={lv.gapPoints >= 0 ? "bull" : "bear"}
              hint={fmtPct(lv.gapPct)}
            />
            <StatTile
              label="Overnight Range"
              value={fmtPrice(lv.overnightHigh - lv.overnightLow, dec)}
              hint={`${fmtPrice(lv.overnightLow, dec)} – ${fmtPrice(lv.overnightHigh, dec)}`}
            />
          </div>

          <div>
            <div className="text-2xs uppercase tracking-[0.14em] text-text-muted mb-1.5">
              Overnight Sessions
            </div>
            <div className="grid grid-cols-2 gap-2">
              <StatTile label="Asia High" value={fmtPrice(lv.asiaHigh, dec)} tone="info" />
              <StatTile label="Asia Low" value={fmtPrice(lv.asiaLow, dec)} tone="info" />
              <StatTile label="London High" value={fmtPrice(lv.londonHigh, dec)} tone="info" />
              <StatTile label="London Low" value={fmtPrice(lv.londonLow, dec)} tone="info" />
              <StatTile label="ON High" value={fmtPrice(lv.overnightHigh, dec)} tone="warn" />
              <StatTile label="ON Low" value={fmtPrice(lv.overnightLow, dec)} tone="warn" />
            </div>
          </div>

          <div>
            <div className="text-2xs uppercase tracking-[0.14em] text-text-muted mb-1.5">
              Prior Day / Week / Month
            </div>
            <div className="grid grid-cols-2 gap-2">
              <StatTile label="PDH" value={fmtPrice(lv.prevDayHigh, dec)} />
              <StatTile label="PDL" value={fmtPrice(lv.prevDayLow, dec)} />
              <StatTile label="PDC" value={fmtPrice(lv.prevDayClose, dec)} />
              <StatTile
                label="Last"
                value={fmtPrice(quote.last, dec)}
                tone={quote.change >= 0 ? "bull" : "bear"}
              />
              <StatTile label="PWH" value={fmtPrice(lv.prevWeekHigh, dec)} />
              <StatTile label="PWL" value={fmtPrice(lv.prevWeekLow, dec)} />
              <StatTile label="PMH" value={fmtPrice(lv.prevMonthHigh, dec)} />
              <StatTile label="PML" value={fmtPrice(lv.prevMonthLow, dec)} />
            </div>
          </div>
        </div>
      )}
    </GlassCard>
  );
}
