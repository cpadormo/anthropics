"use client";

import { useEffect, useMemo, useState } from "react";
import { ArrowDown, ArrowUp, ChevronsUpDown } from "lucide-react";
import { GlassCard } from "../ui/glass-card";
import { useQuotes } from "@/lib/hooks/use-quotes";
import { INSTRUMENTS, OVERVIEW_SYMBOLS } from "@/lib/instruments";
import { cn, fmtPct, fmtPrice, fmtSigned } from "@/lib/utils";

type Col = "symbol" | "last" | "changePct" | "change";
type Dir = "asc" | "desc";

const KEY = "nqdesk.watchlist.v1";

export function Watchlist() {
  const [symbols, setSymbols] = useState<string[]>(OVERVIEW_SYMBOLS);
  const [notes, setNotes] = useState<Record<string, string>>({});
  const [sort, setSort] = useState<{ col: Col; dir: Dir }>({ col: "changePct", dir: "desc" });
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) {
        const p = JSON.parse(raw);
        if (Array.isArray(p.symbols)) setSymbols(p.symbols.filter((s: string) => INSTRUMENTS[s]));
        if (p.notes) setNotes(p.notes);
      }
    } catch {
      /* ignore */
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem(KEY, JSON.stringify({ symbols, notes }));
    } catch {
      /* best-effort */
    }
  }, [symbols, notes, hydrated]);

  const quotes = useQuotes(symbols);

  const rows = useMemo(() => {
    const items = symbols.map((s) => ({ symbol: s, q: quotes[s], inst: INSTRUMENTS[s] }));
    const sign = sort.dir === "asc" ? 1 : -1;
    items.sort((a, b) => {
      if (!a.q && !b.q) return 0;
      if (!a.q) return 1;
      if (!b.q) return -1;
      switch (sort.col) {
        case "symbol":
          return sign * a.symbol.localeCompare(b.symbol);
        case "last":
          return sign * (a.q.last - b.q.last);
        case "change":
          return sign * (a.q.change - b.q.change);
        case "changePct":
          return sign * (a.q.changePct - b.q.changePct);
      }
    });
    return items;
  }, [symbols, quotes, sort]);

  function toggleSort(col: Col) {
    setSort((prev) =>
      prev.col === col ? { col, dir: prev.dir === "asc" ? "desc" : "asc" } : { col, dir: "desc" },
    );
  }
  function remove(symbol: string) {
    setSymbols((s) => s.filter((x) => x !== symbol));
  }

  return (
    <GlassCard title="Watchlist" subtitle="Editable · persists locally">
      <table className="w-full text-xs">
        <thead className="text-2xs uppercase tracking-[0.12em] text-text-muted">
          <tr>
            <Th col="symbol" sort={sort} onClick={toggleSort}>Symbol</Th>
            <Th col="last" sort={sort} onClick={toggleSort} align="right">Last</Th>
            <Th col="change" sort={sort} onClick={toggleSort} align="right">Chg</Th>
            <Th col="changePct" sort={sort} onClick={toggleSort} align="right">%</Th>
            <th className="text-left font-medium pl-3">Note</th>
            <th />
          </tr>
        </thead>
        <tbody>
          {rows.map(({ symbol, q, inst }) => {
            const up = q ? q.change >= 0 : false;
            return (
              <tr key={symbol} className="group border-t border-white/[0.04] hover:bg-white/[0.025]">
                <td className="py-1.5 font-mono text-text-primary">{inst.display}</td>
                <td className="py-1.5 text-right font-mono tabular-nums text-text-primary">
                  {q ? fmtPrice(q.last, inst.priceDecimals) : "—"}
                </td>
                <td
                  className={cn(
                    "py-1.5 text-right font-mono tabular-nums",
                    q ? (up ? "text-bull" : "text-bear") : "text-text-muted",
                  )}
                >
                  {q ? fmtSigned(q.change, inst.priceDecimals) : "—"}
                </td>
                <td
                  className={cn(
                    "py-1.5 text-right font-mono tabular-nums",
                    q ? (up ? "text-bull" : "text-bear") : "text-text-muted",
                  )}
                >
                  {q ? fmtPct(q.changePct) : "—"}
                </td>
                <td className="py-1.5 pl-3">
                  <input
                    value={notes[symbol] ?? ""}
                    onChange={(e) => setNotes((n) => ({ ...n, [symbol]: e.target.value }))}
                    placeholder="—"
                    className="w-full bg-transparent text-text-secondary placeholder:text-text-muted/60 outline-none focus:text-text-primary"
                  />
                </td>
                <td className="py-1.5 text-right">
                  <button
                    onClick={() => remove(symbol)}
                    className="opacity-0 group-hover:opacity-100 text-2xs text-text-muted hover:text-bear px-1.5"
                    title="Remove"
                  >
                    ×
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
      <AddSymbol
        existing={symbols}
        onAdd={(s) => setSymbols((cur) => (cur.includes(s) ? cur : [...cur, s]))}
      />
    </GlassCard>
  );
}

function Th({
  children,
  col,
  sort,
  onClick,
  align,
}: {
  children: React.ReactNode;
  col: Col;
  sort: { col: Col; dir: Dir };
  onClick: (c: Col) => void;
  align?: "left" | "right";
}) {
  const active = sort.col === col;
  const Icon = !active ? ChevronsUpDown : sort.dir === "asc" ? ArrowUp : ArrowDown;
  return (
    <th className={cn("py-1.5 font-medium", align === "right" ? "text-right" : "text-left")}>
      <button
        onClick={() => onClick(col)}
        className={cn(
          "inline-flex items-center gap-1 hover:text-text-secondary",
          active && "text-text-primary",
        )}
      >
        <span>{children}</span>
        <Icon size={10} />
      </button>
    </th>
  );
}

function AddSymbol({
  existing,
  onAdd,
}: {
  existing: string[];
  onAdd: (s: string) => void;
}) {
  const available = Object.keys(INSTRUMENTS).filter((s) => !existing.includes(s));
  if (!available.length) return null;
  return (
    <div className="mt-3 flex flex-wrap gap-1">
      <span className="text-2xs text-text-muted self-center mr-1">+ Add</span>
      {available.map((s) => (
        <button
          key={s}
          onClick={() => onAdd(s)}
          className="px-2 py-0.5 text-2xs font-mono rounded border border-white/5 bg-white/[0.02] text-text-secondary hover:border-accent/40 hover:text-text-primary"
        >
          {s}
        </button>
      ))}
    </div>
  );
}
