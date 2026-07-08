"use client";

import { GlassCard } from "../ui/glass-card";
import { StatTile } from "../ui/stat-tile";
import { useInternals } from "@/lib/hooks/use-internals";
import { cn } from "@/lib/utils";

type Tone = "bull" | "bear" | "default";

function tone(v: number, threshold: number): Tone {
  if (v > threshold) return "bull";
  if (v < -threshold) return "bear";
  return "default";
}

export function MarketInternals() {
  const { internals: i, demo } = useInternals();
  return (
    <GlassCard
      title="Market Internals"
      subtitle="NYSE / NASDAQ breadth"
      actions={
        demo ? (
          <span
            className="text-2xs uppercase tracking-[0.12em] px-1.5 py-0.5 rounded bg-warn-soft text-warn border border-warn/30"
            title="Set IQFEED_BRIDGE_URL for real internals"
          >
            synthetic
          </span>
        ) : (
          <span className="text-2xs uppercase tracking-[0.12em] px-1.5 py-0.5 rounded bg-bull-soft text-bull border border-bull/30">
            live
          </span>
        )
      }
    >
      {!i ? (
        <div className="text-text-muted text-sm">Loading…</div>
      ) : (
        <div className="space-y-2">
          <div className="grid grid-cols-2 gap-2">
            <StatTile
              label="NYSE TICK"
              value={Math.round(i.nyseTick).toString()}
              tone={tone(i.nyseTick, 400)}
              hint={Math.abs(i.nyseTick) > 1000 ? "Extreme reading" : undefined}
            />
            <StatTile
              label="NASDAQ TICK"
              value={Math.round(i.nasdaqTick).toString()}
              tone={tone(i.nasdaqTick, 400)}
              hint={Math.abs(i.nasdaqTick) > 1000 ? "Extreme reading" : undefined}
            />
            <StatTile
              label="TRIN"
              value={i.trin.toFixed(2)}
              tone={i.trin < 1 ? "bull" : "bear"}
              hint={
                i.trin < 0.8
                  ? "Strong buying"
                  : i.trin > 1.2
                    ? "Heavy selling"
                    : "Balanced"
              }
            />
            <StatTile
              label="A / D"
              value={i.advanceDecline.toString()}
              tone={tone(i.advanceDecline, 1000)}
              hint="Advancers − decliners"
            />
            <StatTile
              label="ADD Line"
              value={i.addLine.toLocaleString()}
              tone={tone(i.addLine, 5000)}
              hint="Cumulative"
            />
            <StatTile
              label="Put / Call"
              value={i.putCall.toFixed(2)}
              tone={i.putCall > 1 ? "bear" : "bull"}
              hint={
                i.putCall > 1.1
                  ? "Bearish skew"
                  : i.putCall < 0.7
                    ? "Bullish skew"
                    : "Neutral"
              }
            />
          </div>
          <RiskOnGauge value={i.riskOn} />
        </div>
      )}
    </GlassCard>
  );
}

function RiskOnGauge({ value }: { value: number }) {
  const pct = ((value + 1) / 2) * 100;
  const label = value > 0.3 ? "Risk On" : value < -0.3 ? "Risk Off" : "Neutral";
  const labelColor =
    value > 0.3 ? "text-bull" : value < -0.3 ? "text-bear" : "text-text-secondary";
  return (
    <div className="rounded-lg px-2.5 py-2 bg-white/[0.02] border border-white/[0.04]">
      <div className="flex items-baseline justify-between">
        <div className="text-2xs uppercase tracking-[0.12em] text-text-muted">
          Risk Regime
        </div>
        <div className={cn("text-xs font-medium", labelColor)}>{label}</div>
      </div>
      <div className="relative mt-1.5 h-2 rounded-full overflow-hidden bg-white/[0.04]">
        <div className="absolute inset-0 bg-gradient-to-r from-bear/60 via-text-muted/30 to-bull/60" />
        <div
          className="absolute top-1/2 w-1 h-3 bg-text-primary rounded-full shadow-glow"
          style={{ left: `${pct}%`, transform: "translate(-50%, -50%)" }}
        />
      </div>
      <div className="flex justify-between text-2xs text-text-muted mt-1">
        <span>Off</span>
        <span>Neutral</span>
        <span>On</span>
      </div>
    </div>
  );
}
