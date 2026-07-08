"use client";

import { useMemo, useState } from "react";
import { GlassCard } from "../ui/glass-card";
import { StatTile } from "../ui/stat-tile";
import { useCandles } from "@/lib/hooks/use-candles";
import { useQuote } from "@/lib/hooks/use-quotes";
import { atr } from "@/lib/indicators";
import { INSTRUMENTS } from "@/lib/instruments";
import { cn, fmtPct, fmtPrice } from "@/lib/utils";

const SYMBOLS = ["NQ", "ES", "RTY", "YM"];
const TRADING_DAYS_PER_YEAR = 252;

export function VolatilityWidget() {
  const [symbol, setSymbol] = useState("NQ");
  const inst = INSTRUMENTS[symbol];
  const quote = useQuote(symbol);
  const vix = useQuote("VIX");
  const candles = useCandles(symbol, "D", 30);

  const derived = useMemo(() => {
    if (!candles || candles.length < 21) return null;
    const atrArr = atr(candles, 14);
    const atrVal = atrArr[atrArr.length - 1] ?? null;

    // Annualized 20-day realized vol from log returns.
    const closes = candles.map((c) => c.close);
    const returns: number[] = [];
    for (let i = 1; i < closes.length; i++) returns.push(Math.log(closes[i] / closes[i - 1]));
    const window = returns.slice(-20);
    const mean = window.reduce((a, b) => a + b, 0) / window.length;
    const variance = window.reduce((a, b) => a + (b - mean) ** 2, 0) / window.length;
    const realized = Math.sqrt(variance * TRADING_DAYS_PER_YEAR) * 100;

    const today = candles[candles.length - 1];
    const todayRange = today.high - today.low;

    return { atrVal, realized, todayRange };
  }, [candles]);

  // 1-day expected move from VIX:  S * (VIX/100) * sqrt(1/252)
  const expectedMove = useMemo(() => {
    if (!quote || !vix) return null;
    return quote.last * (vix.last / 100) * Math.sqrt(1 / TRADING_DAYS_PER_YEAR);
  }, [quote, vix]);

  // VVIX needs a dedicated feed; show a placeholder until V2B-2 wires it up.
  const vvix = vix ? 88 + Math.sin(vix.ts / 1e8) * 5 : null;

  const adrPct = derived?.atrVal != null && quote ? (derived.atrVal / quote.last) * 100 : null;
  const rangeVsAtrPct =
    derived?.todayRange != null && derived.atrVal != null
      ? (derived.todayRange / derived.atrVal) * 100
      : null;

  return (
    <GlassCard
      title="Volatility"
      subtitle={inst.name}
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
      <div className="grid grid-cols-2 gap-2">
        <StatTile
          label="VIX"
          value={vix ? vix.last.toFixed(2) : "—"}
          tone={vix ? (vix.changePct >= 0 ? "warn" : "bull") : "default"}
          hint={vix ? fmtPct(vix.changePct) : undefined}
        />
        <StatTile
          label="VVIX"
          value={vvix != null ? vvix.toFixed(1) : "—"}
          hint="VIX-of-VIX (placeholder)"
        />
        <StatTile
          label="ATR (14, D)"
          value={derived?.atrVal != null ? fmtPrice(derived.atrVal, inst.priceDecimals) : "—"}
          hint={adrPct != null ? `${adrPct.toFixed(2)}% of price` : undefined}
        />
        <StatTile
          label="Realized Vol (20d)"
          value={derived?.realized != null ? `${derived.realized.toFixed(1)}%` : "—"}
          hint="annualized"
        />
        <StatTile
          label="Today's Range"
          value={
            derived?.todayRange != null
              ? fmtPrice(derived.todayRange, inst.priceDecimals)
              : "—"
          }
          hint={rangeVsAtrPct != null ? `${rangeVsAtrPct.toFixed(0)}% of ATR` : undefined}
          tone={rangeVsAtrPct != null && rangeVsAtrPct > 80 ? "warn" : "default"}
        />
        <StatTile
          label="Expected Move (1D)"
          value={
            expectedMove != null ? `±${fmtPrice(expectedMove, inst.priceDecimals)}` : "—"
          }
          tone="info"
          hint={vix ? "from VIX" : undefined}
        />
      </div>
    </GlassCard>
  );
}
