"use client";

import { useMemo } from "react";
import { GlassCard } from "../ui/glass-card";
import { Countdown } from "../ui/countdown";
import { useCalendar } from "@/lib/hooks/use-calendar";
import type { CalendarEvent, EventCategory } from "@/lib/data/calendar";
import { cn } from "@/lib/utils";

const IMPACT_TONE: Record<CalendarEvent["impact"], string> = {
  high: "bg-bear/15 text-bear border-bear/30",
  medium: "bg-warn/15 text-warn border-warn/30",
  low: "bg-white/[0.04] text-text-muted border-white/5",
};

const CATEGORY_BADGE: Partial<Record<EventCategory, string>> = {
  CPI: "bg-bear-soft text-bear",
  PPI: "bg-bear-soft text-bear",
  NFP: "bg-accent-soft text-accent",
  FOMC: "bg-warn-soft text-warn",
  POWELL: "bg-warn-soft text-warn",
  TREASURY: "bg-info-soft text-info",
  OPEX: "bg-accent-soft text-accent",
};

export function CalendarWidget() {
  const { events, demo } = useCalendar();

  const next = useMemo(() => {
    const now = Date.now();
    return (
      events
        .filter((e) => e.time > now && e.impact === "high")
        .sort((a, b) => a.time - b.time)[0] ?? null
    );
  }, [events]);

  return (
    <GlassCard
      title="Economic Calendar"
      subtitle="US · High & Medium impact"
      actions={
        demo ? (
          <span
            className="text-2xs uppercase tracking-[0.12em] px-1.5 py-0.5 rounded bg-warn-soft text-warn border border-warn/30"
            title="Set FINNHUB_API_KEY in .env.local for live data"
          >
            demo
          </span>
        ) : null
      }
    >
      {next && (
        <div className="mb-3 rounded-lg border border-bear/30 bg-bear-soft px-3 py-2">
          <div className="flex items-baseline justify-between gap-2">
            <div className="text-2xs uppercase tracking-[0.12em] text-text-muted">
              Next high-impact
            </div>
            <Countdown target={next.time} className="text-bear font-medium text-sm" />
          </div>
          <div className="text-sm text-text-primary mt-0.5 truncate">{next.event}</div>
        </div>
      )}

      <table className="w-full text-xs">
        <thead className="text-2xs uppercase tracking-[0.12em] text-text-muted">
          <tr>
            <th className="text-left font-medium py-1.5">Time</th>
            <th className="text-left font-medium py-1.5">Event</th>
            <th className="text-center font-medium py-1.5">Imp</th>
            <th className="text-right font-medium py-1.5">Est</th>
            <th className="text-right font-medium py-1.5">Prev</th>
            <th className="text-right font-medium py-1.5">Act</th>
          </tr>
        </thead>
        <tbody>
          {events.slice(0, 16).map((e) => {
            const past = e.time < Date.now();
            return (
              <tr
                key={e.id}
                className={cn("border-t border-white/[0.04]", past && "opacity-50")}
              >
                <td className="py-1.5 pr-2 font-mono tabular-nums text-text-secondary whitespace-nowrap">
                  {fmtEt(e.time)}
                </td>
                <td className="py-1.5 pr-2 text-text-primary">
                  <span className="inline-flex items-center gap-1.5">
                    <span className="truncate">{e.event}</span>
                    {CATEGORY_BADGE[e.category] && (
                      <span
                        className={cn(
                          "text-2xs px-1 py-0.5 rounded font-medium uppercase tracking-wide",
                          CATEGORY_BADGE[e.category],
                        )}
                      >
                        {e.category}
                      </span>
                    )}
                  </span>
                </td>
                <td className="py-1.5 text-center">
                  <span
                    className={cn(
                      "text-2xs px-1.5 py-0.5 rounded uppercase border",
                      IMPACT_TONE[e.impact],
                    )}
                  >
                    {e.impact[0]}
                  </span>
                </td>
                <td className="py-1.5 text-right font-mono tabular-nums text-text-secondary">
                  {fmtNum(e.estimate, e.unit) ?? "—"}
                </td>
                <td className="py-1.5 text-right font-mono tabular-nums text-text-muted">
                  {fmtNum(e.prev, e.unit) ?? "—"}
                </td>
                <td
                  className={cn(
                    "py-1.5 text-right font-mono tabular-nums",
                    e.actual != null
                      ? actualTone(e.actual, e.estimate)
                      : "text-text-muted",
                  )}
                >
                  {fmtNum(e.actual, e.unit) ?? "—"}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </GlassCard>
  );
}

function fmtEt(ms: number): string {
  return new Date(ms).toLocaleTimeString("en-US", {
    hour12: false,
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "America/New_York",
  });
}

function fmtNum(v: number | null, unit: string): string | null {
  if (v == null) return null;
  // Choose decimal places loosely from magnitude
  const abs = Math.abs(v);
  const dec = abs >= 1000 ? 0 : abs >= 10 ? 1 : 2;
  return `${v.toFixed(dec)}${unit}`;
}

function actualTone(actual: number, est: number | null): string {
  if (est == null) return "text-text-primary font-medium";
  if (actual > est) return "text-bear font-medium";
  if (actual < est) return "text-bull font-medium";
  return "text-text-primary font-medium";
}
