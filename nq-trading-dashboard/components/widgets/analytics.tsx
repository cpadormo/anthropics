"use client";

import { useMemo } from "react";
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
import { computeStats } from "@/lib/data/journal";
import { useJournal } from "@/lib/hooks/use-journal";

const tooltipStyle = {
  background: "rgba(11,15,23,0.95)",
  border: "1px solid rgba(255,255,255,0.08)",
  borderRadius: 8,
  fontSize: 11,
  color: "#e6edf6",
} as const;

export function AnalyticsWidget() {
  const { trades } = useJournal();
  const stats = useMemo(() => computeStats(trades), [trades]);

  return (
    <GlassCard
      title="Performance Analytics"
      subtitle={`${stats.count} closed trade${stats.count === 1 ? "" : "s"}`}
    >
      {stats.count === 0 ? (
        <div className="text-text-muted text-sm py-6 text-center">
          Log closed trades in the Journal to populate analytics.
        </div>
      ) : (
        <div className="space-y-3">
          <div className="grid grid-cols-3 gap-2">
            <StatTile
              label="Win Rate"
              value={`${(stats.winRate * 100).toFixed(1)}%`}
              tone={stats.winRate >= 0.5 ? "bull" : "bear"}
              hint={`${stats.winners}W / ${stats.losers}L`}
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
              label="Avg Win"
              value={`+${stats.avgWin.toFixed(2)}R`}
              tone="bull"
            />
            <StatTile
              label="Avg Loss"
              value={`−${stats.avgLoss.toFixed(2)}R`}
              tone="bear"
            />
            <StatTile
              label="Max DD"
              value={`−${stats.maxDrawdown.toFixed(2)}R`}
              tone="warn"
              hint={`−$${stats.maxDrawdownDollars.toFixed(0)}`}
            />
            <StatTile
              label="Total R"
              value={`${stats.totalR >= 0 ? "+" : "−"}${Math.abs(stats.totalR).toFixed(2)}R`}
              tone={stats.totalR >= 0 ? "bull" : "bear"}
            />
            <StatTile
              label="Net $"
              value={`${stats.totalDollars >= 0 ? "+" : "−"}$${Math.abs(stats.totalDollars).toFixed(0)}`}
              tone={stats.totalDollars >= 0 ? "bull" : "bear"}
            />
            <StatTile
              label="Trades"
              value={stats.count.toString()}
              hint={stats.scratches ? `${stats.scratches} scratch` : undefined}
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
                    name="Cumulative R"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div>
            <div className="text-2xs uppercase tracking-[0.12em] text-text-muted mb-1.5">
              R-Multiple Distribution
            </div>
            <div className="h-[110px]">
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
      )}
    </GlassCard>
  );
}
