"use client";

import { GlassCard } from "../ui/glass-card";
import { useInsights } from "@/lib/hooks/use-insights";
import type { Insight } from "@/lib/data/insights";
import { cn } from "@/lib/utils";

const SYMBOL = "NQ";

const TONE_BG: Record<Insight["tone"], string> = {
  bull: "bg-bull-soft border-bull/30",
  bear: "bg-bear-soft border-bear/30",
  warn: "bg-warn-soft border-warn/30",
  info: "bg-info-soft border-info/30",
};

const TONE_TEXT: Record<Insight["tone"], string> = {
  bull: "text-bull",
  bear: "text-bear",
  warn: "text-warn",
  info: "text-info",
};

export function AiInsightsWidget() {
  const insights = useInsights(SYMBOL);
  return (
    <GlassCard
      title="AI Insights"
      subtitle="Pattern + regime detection · NQ"
      actions={
        <span className="text-2xs text-text-muted">{insights.length} active</span>
      }
    >
      {!insights.length ? (
        <div className="text-text-muted text-sm">
          No actionable patterns detected. Waiting for setup.
        </div>
      ) : (
        <div className="space-y-1.5">
          {insights.map((i) => (
            <div key={i.id} className={cn("rounded-lg border p-2", TONE_BG[i.tone])}>
              <div className="flex items-center justify-between gap-2">
                <span className={cn("text-xs font-medium", TONE_TEXT[i.tone])}>
                  {i.label}
                </span>
                <span className="text-2xs font-mono tabular-nums text-text-muted">
                  {Math.round(i.confidence * 100)}%
                </span>
              </div>
              <div className="text-2xs text-text-secondary mt-0.5 leading-relaxed">
                {i.description}
              </div>
            </div>
          ))}
        </div>
      )}
    </GlassCard>
  );
}
