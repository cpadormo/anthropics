"use client";

import { useMemo, useState } from "react";
import { GlassCard } from "../ui/glass-card";
import { useCandles } from "@/lib/hooks/use-candles";
import { INSTRUMENTS } from "@/lib/instruments";
import type { Candle } from "@/lib/types";
import { cn } from "@/lib/utils";

const SYMBOLS = ["NQ", "ES", "RTY", "YM"];
const BIN_COUNT = 40;
const VALUE_AREA = 0.7;
const BARS = 80; // ~6.5h on 5m candles, roughly one RTH session

interface Profile {
  bins: { price: number; volume: number }[];
  pocIdx: number;
  pocPrice: number;
  vah: number;
  val: number;
  totalVolume: number;
  high: number;
  low: number;
  step: number;
}

function computeProfile(candles: Candle[]): Profile | null {
  if (candles.length < 2) return null;
  const high = Math.max(...candles.map((c) => c.high));
  const low = Math.min(...candles.map((c) => c.low));
  if (high <= low) return null;
  const step = (high - low) / BIN_COUNT;
  const bins = Array.from({ length: BIN_COUNT }, (_, i) => ({
    price: low + (i + 0.5) * step,
    volume: 0,
  }));
  // Uniform distribution of each bar's volume across its high/low range.
  for (const c of candles) {
    const startBin = Math.max(0, Math.floor((c.low - low) / step));
    const endBin = Math.min(BIN_COUNT - 1, Math.floor((c.high - low) / step));
    const span = Math.max(1, endBin - startBin + 1);
    const slice = c.volume / span;
    for (let b = startBin; b <= endBin; b++) bins[b].volume += slice;
  }
  const totalVolume = bins.reduce((a, b) => a + b.volume, 0);
  let pocIdx = 0;
  for (let i = 1; i < bins.length; i++) {
    if (bins[i].volume > bins[pocIdx].volume) pocIdx = i;
  }
  // Value area: expand outward from POC until 70% of volume is captured.
  const target = totalVolume * VALUE_AREA;
  let cum = bins[pocIdx].volume;
  let lo = pocIdx;
  let hi = pocIdx;
  while (cum < target && (lo > 0 || hi < bins.length - 1)) {
    const lv = lo > 0 ? bins[lo - 1].volume : -1;
    const hv = hi < bins.length - 1 ? bins[hi + 1].volume : -1;
    if (lv >= hv && lo > 0) {
      lo--;
      cum += bins[lo].volume;
    } else if (hi < bins.length - 1) {
      hi++;
      cum += bins[hi].volume;
    } else {
      break;
    }
  }
  return {
    bins,
    pocIdx,
    pocPrice: bins[pocIdx].price,
    vah: bins[hi].price + step / 2,
    val: bins[lo].price - step / 2,
    totalVolume,
    high,
    low,
    step,
  };
}

export function VolumeProfileWidget() {
  const [symbol, setSymbol] = useState("NQ");
  const inst = INSTRUMENTS[symbol];
  const candles = useCandles(symbol, "5m", BARS);
  const profile = useMemo(() => (candles ? computeProfile(candles) : null), [candles]);

  return (
    <GlassCard
      title="Volume Profile"
      subtitle={`${inst.name} · 5m · ${BARS} bars`}
      actions={
        <div className="flex gap-0.5 rounded-md bg-white/[0.04] p-0.5">
          {SYMBOLS.map((s) => (
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
      {!profile ? (
        <div className="text-text-muted text-sm">Loading…</div>
      ) : (
        <ProfileBody profile={profile} dec={inst.priceDecimals} />
      )}
    </GlassCard>
  );
}

function ProfileBody({ profile, dec }: { profile: Profile; dec: number }) {
  const maxVol = Math.max(...profile.bins.map((b) => b.volume));
  return (
    <div className="flex flex-col gap-2 h-full">
      {/* Bins render top-down with highest price at the top */}
      <div className="flex-1 flex flex-col-reverse min-h-[220px]">
        {profile.bins.map((b, i) => {
          const w = maxVol > 0 ? (b.volume / maxVol) * 100 : 0;
          const inVA = i >= findIdx(profile.val, profile) && i <= findIdx(profile.vah, profile);
          const isPoc = i === profile.pocIdx;
          const color = isPoc
            ? "bg-warn/70"
            : inVA
              ? "bg-accent/45"
              : "bg-white/15";
          return (
            <div key={i} className="flex items-center gap-2 h-[8px]">
              <div className="w-14 text-right text-2xs font-mono text-text-muted tabular-nums">
                {b.price.toFixed(dec)}
              </div>
              <div className="flex-1 h-full bg-white/[0.02] rounded-sm overflow-hidden">
                <div className={cn("h-full", color)} style={{ width: `${w}%` }} />
              </div>
            </div>
          );
        })}
      </div>
      <div className="grid grid-cols-3 gap-2 pt-2 border-t border-white/5">
        <Mini label="POC" value={profile.pocPrice.toFixed(dec)} tone="warn" />
        <Mini label="VAH" value={profile.vah.toFixed(dec)} tone="info" />
        <Mini label="VAL" value={profile.val.toFixed(dec)} tone="info" />
      </div>
    </div>
  );
}

function findIdx(price: number, profile: Profile): number {
  const idx = Math.round((price - profile.low) / profile.step - 0.5);
  return Math.max(0, Math.min(profile.bins.length - 1, idx));
}

function Mini({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone: "warn" | "info";
}) {
  const color = tone === "warn" ? "text-warn" : "text-info";
  return (
    <div className="flex flex-col items-center">
      <div className="text-2xs uppercase tracking-[0.12em] text-text-muted">{label}</div>
      <div className={cn("font-mono tabular-nums text-sm", color)}>{value}</div>
    </div>
  );
}
