"use client";

import { GlassCard } from "../ui/glass-card";
import { StatTile } from "../ui/stat-tile";
import { useOptions } from "@/lib/hooks/use-options";
import { useQuote } from "@/lib/hooks/use-quotes";
import { INSTRUMENTS } from "@/lib/instruments";
import { fmtPct, fmtPrice } from "@/lib/utils";

const SYMBOL = "NQ";

export function OptionsWidget() {
  const inst = INSTRUMENTS[SYMBOL];
  const quote = useQuote(SYMBOL);
  const opt = useOptions(SYMBOL);
  const dec = inst.priceDecimals;

  return (
    <GlassCard
      title="Options"
      subtitle={`${inst.name} · NDX proxy`}
      actions={
        <span
          className="text-2xs uppercase tracking-[0.12em] px-1.5 py-0.5 rounded bg-warn-soft text-warn border border-warn/30"
          title="OI / GEX are synthetic until a real feed (SpotGamma / Unusual Whales) is wired in V4. Expected move uses the real VIX quote."
        >
          demo
        </span>
      }
    >
      {!opt || !quote ? (
        <div className="text-text-muted text-sm">Loading…</div>
      ) : (
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-2">
            <StatTile
              label="Total GEX"
              value={`${opt.gexBn >= 0 ? "+" : "−"}$${Math.abs(opt.gexBn).toFixed(2)}B`}
              tone={opt.gexBn >= 0 ? "bull" : "bear"}
              hint={opt.gexBn >= 0 ? "Vol suppressing" : "Vol amplifying"}
            />
            <StatTile
              label="Dealer Pos"
              value={opt.dealerPos}
              tone={
                opt.dealerPos === "Long Gamma"
                  ? "bull"
                  : opt.dealerPos === "Short Gamma"
                    ? "bear"
                    : "default"
              }
            />
            <StatTile
              label="Max Pain"
              value={fmtPrice(opt.maxPain, dec)}
              tone="warn"
              hint={`${fmtPct(((opt.maxPain - quote.last) / quote.last) * 100)} from spot`}
            />
            <StatTile
              label="Put / Call OI"
              value={opt.putCallOi.toFixed(2)}
              tone={opt.putCallOi > 1 ? "bear" : "bull"}
              hint={opt.putCallOi > 1.1 ? "Bearish skew" : opt.putCallOi < 0.8 ? "Bullish skew" : "Balanced"}
            />
            <StatTile
              label="Expected Move 1D"
              value={`±${fmtPrice(opt.expectedMove1d, dec)}`}
              tone="info"
              hint="from VIX (real)"
            />
            <StatTile
              label="Expected Move 1W"
              value={`±${fmtPrice(opt.expectedMove1w, dec)}`}
              tone="info"
              hint="√5 × 1D"
            />
          </div>

          <div>
            <div className="text-2xs uppercase tracking-[0.12em] text-text-muted mb-1.5">
              Largest OI Strikes
            </div>
            <div className="grid grid-cols-2 gap-3">
              <StrikeList title="Calls" tone="bull" strikes={opt.callStrikes} dec={0} />
              <StrikeList title="Puts" tone="bear" strikes={opt.putStrikes} dec={0} />
            </div>
          </div>
        </div>
      )}
    </GlassCard>
  );
}

function StrikeList({
  title,
  tone,
  strikes,
  dec,
}: {
  title: string;
  tone: "bull" | "bear";
  strikes: { strike: number; oi: number }[];
  dec: number;
}) {
  const titleColor = tone === "bull" ? "text-bull" : "text-bear";
  return (
    <div>
      <div className={`text-2xs uppercase tracking-[0.12em] mb-1 ${titleColor}`}>{title}</div>
      <div className="rounded-lg bg-white/[0.02] border border-white/[0.04] divide-y divide-white/[0.04]">
        {strikes.map((s) => (
          <div
            key={s.strike}
            className="flex justify-between items-center px-2 py-1.5 text-xs font-mono tabular-nums"
          >
            <span className="text-text-primary">{fmtPrice(s.strike, dec)}</span>
            <span className="text-text-muted">{s.oi.toLocaleString()}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
