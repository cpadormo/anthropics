"use client";

import { useEffect, useState } from "react";
import { loadTrades, recompute, saveTrades, type Trade } from "../data/journal";
import { useDbMode, type DbMode } from "./use-db-mode";

function sorted(trades: Trade[]): Trade[] {
  return [...trades].sort((a, b) => b.entryTime - a.entryTime);
}

interface JournalApi {
  trades: Trade[];
  add: (t: Trade) => void;
  update: (id: string, next: Trade) => void;
  remove: (id: string) => void;
  clear: () => void;
  mode: DbMode;
}

export function useJournal(): JournalApi {
  const mode = useDbMode();
  const [trades, setTrades] = useState<Trade[]>([]);

  useEffect(() => {
    if (mode === "checking") return;
    let active = true;
    if (mode === "db") {
      fetch("/api/journal", { cache: "no-store" })
        .then((r) => (r.ok ? r.json() : { trades: [] }))
        .then((d) => {
          if (active) setTrades(sorted(d?.trades ?? []));
        })
        .catch(() => {
          if (active) setTrades(sorted(loadTrades()));
        });
    } else {
      setTrades(sorted(loadTrades()));
    }
    return () => {
      active = false;
    };
  }, [mode]);

  // Mutations apply optimistically. Network calls run in background;
  // failures are not rolled back — V5-2 keeps the contract simple.
  function add(t: Trade) {
    const r = recompute(t);
    const next = sorted([r, ...trades]);
    setTrades(next);
    if (mode === "db") {
      void fetch("/api/journal", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(r),
      });
    } else {
      saveTrades(next);
    }
  }

  function update(id: string, replacement: Trade) {
    const next = sorted(
      trades.map((t) => (t.id === id ? recompute(replacement) : t)),
    );
    setTrades(next);
    if (mode === "db") {
      void fetch(`/api/journal/${id}`, {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(recompute(replacement)),
      });
    } else {
      saveTrades(next);
    }
  }

  function remove(id: string) {
    const next = trades.filter((t) => t.id !== id);
    setTrades(next);
    if (mode === "db") {
      void fetch(`/api/journal/${id}`, { method: "DELETE" });
    } else {
      saveTrades(next);
    }
  }

  function clear() {
    setTrades([]);
    if (mode === "local") saveTrades([]);
    // Bulk clear over DB deferred until needed.
  }

  return { trades, add, update, remove, clear, mode };
}
