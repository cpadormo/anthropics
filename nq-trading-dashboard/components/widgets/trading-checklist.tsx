"use client";

import { useEffect, useState } from "react";
import { Check, RotateCcw } from "lucide-react";
import { GlassCard } from "../ui/glass-card";
import { cn } from "@/lib/utils";

const ITEMS: { id: string; label: string; hint?: string }[] = [
  { id: "trend", label: "Trend confirmed", hint: "Higher TF agrees with entry direction" },
  { id: "news", label: "News checked", hint: "No high-impact print in next 15m" },
  { id: "vwap", label: "VWAP context appropriate to thesis" },
  { id: "risk", label: "Risk calculated", hint: "Dollar risk ≤ daily plan" },
  { id: "rr", label: "R:R at least 2:1" },
  { id: "emotion", label: "No emotional / revenge trading" },
  { id: "dailyloss", label: "Daily max loss not exceeded" },
];

const KEY = "nqdesk.checklist.v1";

export function TradingChecklist() {
  const [state, setState] = useState<Record<string, boolean>>({});
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) setState(JSON.parse(raw));
    } catch {
      /* ignore */
    }
    setHydrated(true);
  }, []);

  function persist(next: Record<string, boolean>) {
    setState(next);
    try {
      localStorage.setItem(KEY, JSON.stringify(next));
    } catch {
      /* persistence best-effort */
    }
  }
  function toggle(id: string) {
    persist({ ...state, [id]: !state[id] });
  }
  function reset() {
    persist({});
  }

  const checked = ITEMS.filter((i) => state[i.id]).length;
  const ready = checked === ITEMS.length;

  return (
    <GlassCard
      title="Pre-Trade Checklist"
      subtitle={
        <span className="text-xs">
          <span className={ready ? "text-bull" : "text-text-secondary"}>{checked}</span>
          <span className="text-text-muted"> / {ITEMS.length} complete</span>
        </span>
      }
      actions={
        <button
          onClick={reset}
          className="flex items-center gap-1 text-2xs text-text-muted hover:text-text-secondary px-2 py-1 rounded-md hover:bg-white/5"
          title="Reset checklist"
        >
          <RotateCcw size={11} />
          Reset
        </button>
      }
    >
      {!hydrated ? null : (
        <>
          <ul className="flex flex-col gap-1.5">
            {ITEMS.map((it) => {
              const on = !!state[it.id];
              return (
                <li key={it.id}>
                  <button
                    onClick={() => toggle(it.id)}
                    className={cn(
                      "w-full text-left flex items-start gap-2.5 px-2.5 py-2 rounded-lg border transition-colors",
                      on
                        ? "border-bull/30 bg-bull-soft"
                        : "border-white/5 bg-white/[0.02] hover:bg-white/[0.04]",
                    )}
                  >
                    <span
                      className={cn(
                        "mt-0.5 w-4 h-4 rounded-md grid place-items-center border",
                        on ? "bg-bull border-bull text-bg-base" : "border-white/15",
                      )}
                    >
                      {on && <Check size={11} strokeWidth={3} />}
                    </span>
                    <span className="flex-1 min-w-0">
                      <div className={cn("text-sm", on ? "text-text-primary" : "text-text-secondary")}>
                        {it.label}
                      </div>
                      {it.hint && <div className="text-2xs text-text-muted">{it.hint}</div>}
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
          {ready && (
            <div className="mt-3 px-2.5 py-2 rounded-lg border border-bull/30 bg-bull-soft text-bull text-xs font-medium">
              Cleared for execution — trade your plan.
            </div>
          )}
        </>
      )}
    </GlassCard>
  );
}
