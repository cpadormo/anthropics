"use client";

import { useEffect, useState } from "react";
import { loadTrades, recompute, saveTrades, type Trade } from "../data/journal";

interface JournalApi {
  trades: Trade[];
  add: (t: Trade) => void;
  update: (id: string, next: Trade) => void;
  remove: (id: string) => void;
  clear: () => void;
}

function sorted(trades: Trade[]): Trade[] {
  return [...trades].sort((a, b) => b.entryTime - a.entryTime);
}

export function useJournal(): JournalApi {
  const [trades, setTrades] = useState<Trade[]>([]);

  useEffect(() => {
    setTrades(sorted(loadTrades()));
  }, []);

  function add(t: Trade) {
    const next = sorted([recompute(t), ...trades]);
    setTrades(next);
    saveTrades(next);
  }

  function update(id: string, replacement: Trade) {
    const next = sorted(
      trades.map((t) => (t.id === id ? recompute(replacement) : t)),
    );
    setTrades(next);
    saveTrades(next);
  }

  function remove(id: string) {
    const next = trades.filter((t) => t.id !== id);
    setTrades(next);
    saveTrades(next);
  }

  function clear() {
    setTrades([]);
    saveTrades([]);
  }

  return { trades, add, update, remove, clear };
}
