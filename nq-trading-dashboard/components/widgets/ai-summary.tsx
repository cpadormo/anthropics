"use client";

import { useMemo } from "react";
import { GlassCard } from "../ui/glass-card";
import { useAiSummary } from "@/lib/hooks/use-ai-summary";
import { useCalendar } from "@/lib/hooks/use-calendar";
import { useInsights } from "@/lib/hooks/use-insights";
import { useInternals } from "@/lib/hooks/use-internals";
import { useQuote } from "@/lib/hooks/use-quotes";
import { useRthStats, useSessionLevels } from "@/lib/hooks/use-session-levels";
import { INSTRUMENTS } from "@/lib/instruments";
import { cn, fmtPrice } from "@/lib/utils";

const SYMBOL = "NQ";

export function AiSummaryWidget() {
  const inst = INSTRUMENTS[SYMBOL];
  const quote = useQuote(SYMBOL);
  const vix = useQuote("VIX");
  const stats = useRthStats(SYMBOL);
  const levels = useSessionLevels(SYMBOL);
  const internals = useInternals();
  const insights = useInsights(SYMBOL);
  const { events } = useCalendar();

  const context = useMemo(() => {
    const nextEvent = events.find((e) => e.time > Date.now() && e.impact === "high");
    return {
      symbol: SYMBOL,
      quote: quote
        ? {
            last: round(quote.last),
            changePct: Number(quote.changePct.toFixed(2)),
          }
        : null,
      vix: vix
        ? { last: Number(vix.last.toFixed(2)), changePct: Number(vix.changePct.toFixed(2)) }
        : null,
      sessionStats: stats,
      sessionLevels: levels,
      internals: internals
        ? {
            tick: Math.round(internals.nyseTick),
            trin: Number(internals.trin.toFixed(2)),
            putCall: Number(internals.putCall.toFixed(2)),
            riskOn: Number(internals.riskOn.toFixed(2)),
          }
        : null,
      activeInsights: insights.map((i) => ({
        label: i.label,
        tone: i.tone,
        description: i.description,
      })),
      nextHighImpactEvent: nextEvent
        ? { name: nextEvent.event, minutesUntil: Math.round((nextEvent.time - Date.now()) / 60000) }
        : null,
    };
  }, [quote?.last, vix?.last, stats, levels, internals, insights, events]);

  const summary = useAiSummary(context);
  const dec = inst.priceDecimals;

  return (
    <GlassCard
      title="AI Market Summary"
      subtitle={
        summary
          ? `Updated ${fmtAgo(summary.generated)} ago · 1m cadence`
          : "Generating…"
      }
      actions={
        summary?.demo ? (
          <span
            className="text-2xs uppercase tracking-[0.12em] px-1.5 py-0.5 rounded bg-warn-soft text-warn border border-warn/30"
            title="Set ANTHROPIC_API_KEY in .env.local for live AI analysis"
          >
            demo
          </span>
        ) : (
          <span className="text-2xs uppercase tracking-[0.12em] px-1.5 py-0.5 rounded bg-accent-soft text-accent border border-accent/30">
            AI
          </span>
        )
      }
    >
      {!summary ? (
        <div className="text-text-muted text-sm animate-pulseSoft">Analyzing context…</div>
      ) : (
        <div className="space-y-3">
          <div className="flex items-baseline justify-between gap-2">
            <div className="flex items-center gap-2 flex-wrap">
              <BiasBadge bias={summary.bias} />
              <PatiencePill level={summary.patienceLevel} />
            </div>
            <span className="text-2xs uppercase tracking-[0.12em] text-text-muted whitespace-nowrap">
              conf {(summary.confidence * 100).toFixed(0)}%
            </span>
          </div>

          <p className="text-sm text-text-secondary leading-relaxed">{summary.reasoning}</p>

          <div className="grid grid-cols-2 gap-2">
            <LevelList title="Support" tone="bull" values={summary.supports} dec={dec} />
            <LevelList title="Resistance" tone="bear" values={summary.resistances} dec={dec} />
          </div>

          <div>
            <div className="text-2xs uppercase tracking-[0.12em] text-text-muted mb-1.5">
              Scenarios
            </div>
            <div className="space-y-1.5">
              {summary.scenarios.map((s, i) => (
                <div key={i} className="rounded-lg p-2 bg-white/[0.02] border border-white/[0.04]">
                  <div className="text-xs font-medium text-text-primary">{s.label}</div>
                  <div className="text-2xs text-text-secondary mt-0.5">{s.description}</div>
                </div>
              ))}
            </div>
          </div>

          <div>
            <div className="text-2xs uppercase tracking-[0.12em] text-text-muted mb-1.5">
              Key Risks
            </div>
            <ul className="space-y-1">
              {summary.risks.map((r, i) => (
                <li key={i} className="text-xs text-text-secondary flex items-start gap-2">
                  <span className="text-warn flex-shrink-0 mt-0.5">!</span>
                  <span className="flex-1">{r}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </GlassCard>
  );
}

function LevelList({
  title,
  tone,
  values,
  dec,
}: {
  title: string;
  tone: "bull" | "bear";
  values: number[];
  dec: number;
}) {
  const wrap =
    tone === "bull"
      ? "bg-bull-soft border-bull/20"
      : "bg-bear-soft border-bear/20";
  const titleColor = tone === "bull" ? "text-bull" : "text-bear";
  return (
    <div className={cn("rounded-lg p-2 border", wrap)}>
      <div className={cn("text-2xs uppercase tracking-[0.12em] mb-1", titleColor)}>{title}</div>
      {values.slice(0, 3).map((v, i) => (
        <div key={i} className="font-mono tabular-nums text-xs text-text-primary">
          {fmtPrice(v, dec)}
        </div>
      ))}
    </div>
  );
}

function BiasBadge({ bias }: { bias: string }) {
  const color =
    bias === "bullish"
      ? "bg-bull text-bg-base"
      : bias === "bearish"
        ? "bg-bear text-white"
        : "bg-white/15 text-text-primary";
  return (
    <span
      className={cn(
        "px-2 py-0.5 rounded text-xs font-semibold uppercase tracking-wide",
        color,
      )}
    >
      {bias}
    </span>
  );
}

function PatiencePill({ level }: { level: string }) {
  const map: Record<string, { label: string; color: string }> = {
    wait: { label: "Wait", color: "border-warn/30 text-warn" },
    selective: { label: "Selective", color: "border-info/30 text-info" },
    engaged: { label: "Engaged", color: "border-bull/30 text-bull" },
  };
  const m = map[level] ?? map.selective;
  return (
    <span
      className={cn(
        "px-2 py-0.5 rounded text-2xs font-medium uppercase tracking-wide border",
        m.color,
      )}
    >
      Patience: {m.label}
    </span>
  );
}

function fmtAgo(ts: number): string {
  const s = Math.max(0, Math.floor((Date.now() - ts) / 1000));
  if (s < 60) return `${s}s`;
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m`;
  return `${Math.floor(m / 60)}h`;
}

function round(v: number): number {
  return Math.round(v * 100) / 100;
}
