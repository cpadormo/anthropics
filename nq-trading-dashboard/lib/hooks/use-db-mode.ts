"use client";

import { useEffect, useState } from "react";

export type DbMode = "checking" | "db" | "local";

let cached: DbMode | null = null;
let inflight: Promise<DbMode> | null = null;

async function probe(): Promise<DbMode> {
  if (cached) return cached;
  if (inflight) return inflight;
  inflight = (async () => {
    try {
      const res = await fetch("/api/health", { cache: "no-store" });
      if (!res.ok) {
        cached = "local";
        return cached;
      }
      const data = (await res.json()) as { db?: boolean };
      cached = data.db ? "db" : "local";
      return cached;
    } catch {
      cached = "local";
      return cached;
    } finally {
      inflight = null;
    }
  })();
  return inflight;
}

export function useDbMode(): DbMode {
  const [mode, setMode] = useState<DbMode>(cached ?? "checking");
  useEffect(() => {
    if (cached) {
      setMode(cached);
      return;
    }
    let active = true;
    probe().then((m) => {
      if (active) setMode(m);
    });
    return () => {
      active = false;
    };
  }, []);
  return mode;
}
