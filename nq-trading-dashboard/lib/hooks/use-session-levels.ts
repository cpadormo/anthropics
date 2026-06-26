"use client";

import { useEffect, useState } from "react";
import { getProvider } from "../data/provider-factory";
import type { RthSessionStats, SessionLevels } from "../types";

// Both hooks poll the provider every ~2s so derived values
// (Tradovate session levels and RTH stats) refresh as real bars stream in.
// Cost on the mock provider is negligible — the inner read is O(1).
export function useSessionLevels(symbol: string): SessionLevels | null {
  const [v, setV] = useState<SessionLevels | null>(null);
  useEffect(() => {
    setV(getProvider().sessionLevels(symbol));
    const id = setInterval(() => setV(getProvider().sessionLevels(symbol)), 2000);
    return () => clearInterval(id);
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
