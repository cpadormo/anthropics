"use client";

import { useMemo, useState } from "react";
import {
  Bar,
  BarChart,
  Cell,
  Line,
  LineChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { GlassCard } from "../ui/glass-card";
import { StatTile } from "../ui/stat-tile";
import { TimeframePicker } from "../ui/timeframe-picker";
import { useBacktest } from "@/lib/hooks/use-backtest";
import { STRATEGIES, type StrategyId } from "@/lib/backtest/strategies";
import type { Timeframe } from "@/lib/types";
import { cn } from "@/lib/utils";

const SYMBOLS = ["NQ", "ES", "RTY", "YM"];
const BAR_COUNTS = [200, 500, 1000];

const tooltipStyle = {
  background: "rgba(11,15,23,0.95)",
  border: "1px solid rgba(255,255,255,0.08)",
  borderRadius: 8,
  fontSize: 11,
  color: "#e6edf6",
} as const;

type ParamRecord = Record<string, number>;

export function BacktestWidget() {
  const [strategyId, setStrategyId] = useState<StrategyId>("ema-cross");
  const [symbol, setSymbol] = useState("NQ");
  const [timeframe, setTimeframe] = useState<Timeframe>("5m");
  const [count, setCount] = useState(500);
  const [paramOverrides, setParamOverrides] = useState<
    Record<StrategyId, ParamRecord>
  >({
    "ema-cross": { ...(STRATEGIES["ema-cross"].defaults as ParamRecord) },
    "rsi-mean-reversion": {
      ...(STRATEGIES["rsi-mean-reversion"].defaults as ParamRecord),
    },
  });

  const params = paramOverrides[strategyId];
  const result = useBacktest({ strategyId, params, symbol, timeframe, count });
  const paramKeys = useMemo(
    () => Object.keys(STRATEGIES[strategyId].defaults as ParamRecord),
    [strategyId],
  );

  function updateParam(key: string, value: number) {
    setParamOverrides((cur) => ({
      ...cur,
      [strategyId]: { ...cur[strategyId], [key]: value },
    }));
  }

  function resetParams() {
    setParamOverrides((cur) => ({
      ...cur,
      [strategyId]: { ...(STRATEGIES[strategyId].defaults as ParamRecord) },
    }));
  }

  return (
    <GlassCard
      title="Backtester"
      subtitle={
        result
          ? `${result.trades.length} trades · ${result.barsLoaded} bars`
          : "Loading bars…"
      }
      actions={
        <div className="flex items-center gap-1">
          <SymbolPicker value={symbol} onChange={setSymbol} />
          <TimeframePicker value={timeframe} onChange={setTimeframe} />
        </div>
      }
    >
      <div className="space-y-3">
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <div className="flex gap-0.5 rounded-md bg-white/[0.04] p-0.5">
            {(Object.keys(STRATEGIES) as StrategyId[]).map((id) => (
              <button
                key={id}
                onClick={() => setStrategyId(id)}
                className={cn(
                  "px-2 py-0.5 text-2xs font-medium rounded",
                  strategyId === id
                    ? "bg-white/10 text-text-primary"
                    : "text-text-muted hover:text-text-secondary",
                )}
              >
                {STRATEGIES[id].label.split(" (")[0]}
              </button>
            ))}
          </div>
          <div className="flex gap-0.5 rounded-md bg-white/[0.04] p-0.5">
            {BAR_COUNTS.map((c) => (
              <button
                key={c}
                onClick={() => setCount(c)}
                className={cn(
                  "px-2 py-0.5 text-2xs font-medium rounded",
                  count === c
                    ? "bg-white/10 text-text-primary"
                    : "text-text-muted hover:text-text-secondary",
                )}
              >
                {c}
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-wrap items-end gap-1.5">
          {paramKeys.map((k) => (
            <ParamField
              key={k}
              label={k}
              value={params[k]}
              onChange={(v) => updateParam(k, v)}
            />
          ))}
          <button
            onClick={resetParams}
            className="text-2xs uppercase tracking-[0.12em] px-2 py-1 rounded-md text-text-muted hover:text-text-secondary"
          >
            reset
          </button>
        </div>

        {!result || result.stats.count === 0 ? (
          <div className="text-text-muted text-sm py-6 text-center">
            {!result
              ? "Loading historical bars…"
              : "Strategy produced no trades on the loaded bars. Try a different timeframe or bar count."}
          </div>
        ) : (
          <BacktestResults
            stats={result.stats}
            barsLoaded={result.barsLoaded}
          />
        )}
      </div>
    </GlassCard>
  );
}

function BacktestResults({
  stats,
  barsLoaded,
}: {
  stats: ReturnType<typeof import("@/lib/data/journal").computeStats>;
  barsLoaded: number;
}) {
  return (
    <div className="space-y-3">
      <div className="grid grid-cols-3 gap-2">
        <StatTile
          label="Trades"
          value={stats.count.toString()}
          hint={`${stats.winners}W / ${stats.losers}L`}
        />
        <StatTile
          label="Win Rate"
          value={`${(stats.winRate * 100).toFixed(1)}%`}
          tone={stats.winRate >= 0.5 ? "bull" : "bear"}
        />
        <StatTile
          label="Profit Factor"
          value={stats.profitFactor === Infinity ? "∞" : stats.profitFactor.toFixed(2)}
          tone={stats.profitFactor > 1 ? "bull" : "bear"}
        />
        <StatTile
          label="Expectancy"
          value={`${stats.expectancy >= 0 ? "+" : ""}${stats.expectancy.toFixed(2)}R`}
          tone={stats.expectancy > 0 ? "bull" : "bear"}
          hint="per trade"
        />
        <StatTile
          label="Total R"
          value={`${stats.totalR >= 0 ? "+" : "−"}${Math.abs(stats.totalR).toFixed(2)}R`}
          tone={stats.totalR >= 0 ? "bull" : "bear"}
        />
        <StatTile
          label="Max DD"
          value={`−${stats.maxDrawdown.toFixed(2)}R`}
          tone="warn"
          hint={`bars: ${barsLoaded}`}
        />
      </div>

      <div>
        <div className="text-2xs uppercase tracking-[0.12em] text-text-muted mb-1.5">
          Equity Curve (R)
        </div>
        <div className="h-[120px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={stats.equityCurve}
              margin={{ top: 4, right: 8, left: 0, bottom: 0 }}
            >
              <XAxis dataKey="idx" hide />
              <YAxis
                orientation="right"
                tick={{ fill: "#5e6a7c", fontSize: 10 }}
                width={40}
                tickFormatter={(v) => Number(v).toFixed(1)}
              />
              <ReferenceLine y={0} stroke="rgba(255,255,255,0.08)" />
              <Tooltip
                contentStyle={tooltipStyle}
                labelFormatter={(l) => `Trade ${l}`}
                formatter={(v) =>
                  typeof v === "number"
                    ? `${v >= 0 ? "+" : ""}${v.toFixed(2)}R`
                    : String(v)
                }
              />
              <Line
                type="monotone"
                dataKey="cumR"
                stroke={stats.totalR >= 0 ? "#22c55e" : "#ef4444"}
                strokeWidth={1.5}
                dot={false}
                isAnimationActive={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div>
        <div className="text-2xs uppercase tracking-[0.12em] text-text-muted mb-1.5">
          R Distribution
        </div>
        <div className="h-[100px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={stats.rDistribution}
              margin={{ top: 4, right: 8, left: 0, bottom: 0 }}
            >
              <XAxis
                dataKey="bucket"
                tick={{ fill: "#5e6a7c", fontSize: 9 }}
                interval={0}
              />
              <YAxis hide />
              <Tooltip
                contentStyle={tooltipStyle}
                labelFormatter={(l) => `${l}R`}
                formatter={(v) => `${v} trades`}
              />
              <Bar dataKey="count" isAnimationActive={false}>
                {stats.rDistribution.map((b, i) => (
                  <Cell
                    key={i}
                    fill={
                      b.centerR >= 0
                        ? "rgba(34,197,94,0.6)"
                        : "rgba(239,68,68,0.6)"
                    }
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

function SymbolPicker({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="flex gap-0.5 rounded-md bg-white/[0.04] p-0.5">
      {SYMBOLS.map((s) => (
        <button
          key={s}
          onClick={() => onChange(s)}
          className={cn(
            "px-2 py-0.5 text-2xs font-medium rounded",
            value === s
              ? "bg-white/10 text-text-primary"
              : "text-text-muted hover:text-text-secondary",
          )}
        >
          {s}
        </button>
      ))}
    </div>
  );
}

function ParamField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
}) {
  return (
    <label className="flex flex-col gap-0.5 rounded-md bg-white/[0.02] border border-white/[0.04] px-2 py-1">
      <span className="text-2xs uppercase tracking-[0.12em] text-text-muted">
        {label}
      </span>
      <input
        type="number"
        value={Number.isFinite(value) ? value : 0}
        step={0.5}
        onChange={(e) => {
          const v = parseFloat(e.target.value);
          if (Number.isFinite(v)) onChange(v);
        }}
        className="bg-transparent w-16 text-xs font-mono tabular-nums text-text-primary outline-none"
      />
    </label>
  );
}
