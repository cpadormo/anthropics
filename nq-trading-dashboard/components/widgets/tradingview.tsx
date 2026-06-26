"use client";

import { useEffect, useRef, useState } from "react";
import { GlassCard } from "../ui/glass-card";
import { cn } from "@/lib/utils";

const SYMBOL_MAP: Record<string, string> = {
  NQ: "CME_MINI:NQ1!",
  ES: "CME_MINI:ES1!",
  RTY: "CME_MINI:RTY1!",
  YM: "CBOT_MINI:YM1!",
};

const SYMBOLS = Object.keys(SYMBOL_MAP);

// Wraps TradingView's advanced-chart embed script. We rebuild on symbol
// switch because the script-injection embed doesn't expose a programmatic
// setSymbol API.
export function TradingViewWidget() {
  const [symbol, setSymbol] = useState("NQ");
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!ref.current) return;
    ref.current.innerHTML = "";

    const inner = document.createElement("div");
    inner.className = "tradingview-widget-container__widget";
    inner.style.height = "100%";
    inner.style.width = "100%";
    ref.current.appendChild(inner);

    const script = document.createElement("script");
    script.src =
      "https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js";
    script.async = true;
    script.text = JSON.stringify({
      autosize: true,
      symbol: SYMBOL_MAP[symbol],
      interval: "5",
      timezone: "America/New_York",
      theme: "dark",
      style: "1",
      withdateranges: true,
      hide_side_toolbar: false,
      allow_symbol_change: true,
      studies: ["STD;VWAP", "STD;EMA"],
      locale: "en",
      backgroundColor: "rgba(11, 15, 23, 1)",
    });
    ref.current.appendChild(script);
  }, [symbol]);

  return (
    <GlassCard
      title="TradingView"
      subtitle="External advanced chart"
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
      <div
        ref={ref}
        className="tradingview-widget-container w-full h-full min-h-[420px]"
      />
    </GlassCard>
  );
}
