"use client";

import { useEffect, useRef, useState } from "react";

export interface AiSummary {
  bias: "bullish" | "bearish" | "neutral";
  confidence: number;
  reasoning: string;
  supports: number[];
  resistances: number[];
  scenarios: { label: string; description: string }[];
  risks: string[];
  patienceLevel: "wait" | "selective" | "engaged";
  generated: number;
  demo?: boolean;
  error?: string;
}

const POLL_MS = 60 * 1000;

// Polls /api/ai/summary on a 60s cadence. The context is captured via ref so
// the every-tick churn doesn't trigger refetches or restart the interval.
export function useAiSummary(context: unknown): AiSummary | null {
  const [summary, setSummary] = useState<AiSummary | null>(null);
  const ctxRef = useRef(context);
  ctxRef.current = context;

  useEffect(() => {
    let active = true;
    const load = async () => {
      try {
        const res = await fetch("/api/ai/summary", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ context: ctxRef.current }),
        });
        if (!res.ok) return;
        const json = (await res.json()) as AiSummary;
        if (active) setSummary(json);
      } catch {
        /* keep previous on transient failure */
      }
    };
    load();
    const id = setInterval(load, POLL_MS);
    return () => {
      active = false;
      clearInterval(id);
    };
  }, []);

  return summary;
}
