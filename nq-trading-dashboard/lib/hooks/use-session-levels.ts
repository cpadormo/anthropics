"use client";

import { useEffect, useState } from "react";
import { getProvider } from "../data/mock-feed";
import type { RthSessionStats, SessionLevels } from "../types";

export function useSessionLevels(symbol: string): SessionLevels | null {
  const [v, setV] = useState<SessionLevels | null>(null);
  useEffect(() => {
    setV(getProvider().sessionLevels(symbol));
  }, [symbol]);
  return v;
}

export function useRthStats(symbol: string): RthSessionStats | null {
  const [v, setV] = useState<RthSessionStats | null>(null);
  useEffect(() => {
    setV(getProvider().rthStats(symbol));
    const id = setInterval(() => setV(getProvider().rthStats(symbol)), 1000);
    return () => clearInterval(id);
  }, [symbol]);
  return v;
}
