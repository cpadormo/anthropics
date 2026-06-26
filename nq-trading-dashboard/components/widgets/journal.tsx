"use client";

import { useState } from "react";
import { Plus, Trash2, X } from "lucide-react";
import { GlassCard } from "../ui/glass-card";
import { useJournal } from "@/lib/hooks/use-journal";
import {
  newTrade,
  POINT_VALUES,
  recompute,
  type Side,
  type Trade,
} from "@/lib/data/journal";
import { cn, fmtPrice } from "@/lib/utils";

const INSTRUMENT_OPTIONS = Object.keys(POINT_VALUES);

export function JournalWidget() {
  const { trades, add, update, remove } = useJournal();
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  return (
    <GlassCard
      title="Trading Journal"
      subtitle={`${trades.length} trade${trades.length === 1 ? "" : "s"} · local`}
      actions={
        !showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-1 text-2xs uppercase tracking-[0.12em] px-2 py-1 rounded-md bg-accent/15 text-accent border border-accent/30 hover:bg-accent/25"
          >
            <Plus size={11} /> Log Trade
          </button>
        )
      }
    >
      {showForm && (
        <TradeForm
          onSave={(t) => {
            add(t);
            setShowForm(false);
          }}
          onCancel={() => setShowForm(false)}
        />
      )}

      {trades.length === 0 && !showForm ? (
        <div className="text-text-muted text-sm py-6 text-center">
          No trades logged. Click <span className="text-text-secondary">Log Trade</span> to start.
        </div>
      ) : (
        <table className="w-full text-xs mt-3">
          <thead className="text-2xs uppercase tracking-[0.12em] text-text-muted">
            <tr>
              <th className="text-left font-medium py-1.5">Time</th>
              <th className="text-left font-medium py-1.5">Sym</th>
              <th className="text-left font-medium py-1.5">Side</th>
              <th className="text-right font-medium py-1.5">Entry</th>
              <th className="text-right font-medium py-1.5">Exit</th>
              <th className="text-right font-medium py-1.5">R</th>
              <th className="text-right font-medium py-1.5">$</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {trades.slice(0, 25).map((t) =>
              editingId === t.id ? (
                <tr key={t.id}>
                  <td colSpan={8} className="py-2">
                    <TradeForm
                      initial={t}
                      onSave={(next) => {
                        update(t.id, next);
                        setEditingId(null);
                      }}
                      onCancel={() => setEditingId(null)}
                    />
                  </td>
                </tr>
              ) : (
                <tr
                  key={t.id}
                  className="group border-t border-white/[0.04] hover:bg-white/[0.025]"
                >
                  <td className="py-1.5 font-mono tabular-nums text-text-secondary whitespace-nowrap">
                    {fmtDate(t.entryTime)}
                  </td>
                  <td className="py-1.5 font-mono text-text-primary">{t.symbol}</td>
                  <td
                    className={cn(
                      "py-1.5 font-medium uppercase text-2xs",
                      t.side === "long" ? "text-bull" : "text-bear",
                    )}
                  >
                    {t.side}
                  </td>
                  <td className="py-1.5 text-right font-mono tabular-nums text-text-secondary">
                    {fmtPrice(t.entry, 2)}
                  </td>
                  <td className="py-1.5 text-right font-mono tabular-nums text-text-secondary">
                    {t.exit != null ? fmtPrice(t.exit, 2) : "—"}
                  </td>
                  <td
                    className={cn(
                      "py-1.5 text-right font-mono tabular-nums",
                      rTone(t.rMultiple),
                    )}
                  >
                    {t.rMultiple != null
                      ? `${t.rMultiple >= 0 ? "+" : ""}${t.rMultiple.toFixed(2)}R`
                      : "—"}
                  </td>
                  <td
                    className={cn(
                      "py-1.5 text-right font-mono tabular-nums",
                      t.pnlDollars != null && t.pnlDollars >= 0
                        ? "text-bull"
                        : t.pnlDollars != null && t.pnlDollars < 0
                          ? "text-bear"
                          : "text-text-muted",
                    )}
                  >
                    {t.pnlDollars != null
                      ? `${t.pnlDollars >= 0 ? "+" : "−"}$${Math.abs(t.pnlDollars).toFixed(0)}`
                      : "—"}
                  </td>
                  <td className="py-1.5 text-right">
                    <div className="opacity-0 group-hover:opacity-100 flex items-center gap-1 justify-end">
                      <button
                        onClick={() => setEditingId(t.id)}
                        className="text-2xs text-text-muted hover:text-text-secondary px-1"
                      >
                        edit
                      </button>
                      <button
                        onClick={() => remove(t.id)}
                        className="text-text-muted hover:text-bear px-1"
                        title="Delete"
                      >
                        <Trash2 size={11} />
                      </button>
                    </div>
                  </td>
                </tr>
              ),
            )}
          </tbody>
        </table>
      )}
    </GlassCard>
  );
}

function rTone(r: number | null): string {
  if (r == null) return "text-text-muted";
  if (r > 0) return "text-bull";
  if (r < 0) return "text-bear";
  return "text-text-muted";
}

function fmtDate(ms: number): string {
  return new Date(ms).toLocaleString("en-US", {
    timeZone: "America/New_York",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}

function TradeForm({
  initial,
  onSave,
  onCancel,
}: {
  initial?: Trade;
  onSave: (t: Trade) => void;
  onCancel: () => void;
}) {
  const [symbol, setSymbol] = useState(initial?.symbol ?? "NQ");
  const [side, setSide] = useState<Side>(initial?.side ?? "long");
  const [entry, setEntry] = useState<number>(initial?.entry ?? 0);
  const [exitV, setExitV] = useState<number>(initial?.exit ?? 0);
  const [stop, setStop] = useState<number>(initial?.stopLoss ?? 0);
  const [contracts, setContracts] = useState<number>(initial?.contracts ?? 1);
  const [setup, setSetup] = useState<string>(initial?.setup ?? "");
  const [tagsText, setTagsText] = useState<string>(
    initial ? initial.tags.join(", ") : "",
  );
  const [notes, setNotes] = useState<string>(initial?.notes ?? "");

  function handleSave() {
    const tagList = tagsText
      .split(",")
      .map((x) => x.trim())
      .filter(Boolean);
    const exitVal = exitV !== 0 ? exitV : null;
    const stopVal = stop !== 0 ? stop : null;

    const next: Trade = initial
      ? {
          ...initial,
          symbol,
          side,
          entry,
          exit: exitVal,
          stopLoss: stopVal,
          contracts,
          pointValue: POINT_VALUES[symbol] ?? 1,
          setup: setup || null,
          tags: tagList,
          notes,
        }
      : newTrade({
          symbol,
          side,
          entry,
          exit: exitVal,
          stopLoss: stopVal,
          contracts,
          setup: setup || null,
          tags: tagList,
          notes,
        });
    onSave(recompute(next));
  }

  return (
    <div className="rounded-lg border border-accent/30 bg-accent/[0.04] p-3 space-y-2">
      <div className="flex items-center justify-between">
        <div className="text-xs font-medium text-text-primary">
          {initial ? "Edit Trade" : "Log New Trade"}
        </div>
        <button
          onClick={onCancel}
          className="text-text-muted hover:text-text-secondary"
        >
          <X size={14} />
        </button>
      </div>
      <div className="grid grid-cols-4 gap-1.5">
        <SelectField
          label="Symbol"
          value={symbol}
          onChange={setSymbol}
          options={INSTRUMENT_OPTIONS}
        />
        <SelectField
          label="Side"
          value={side}
          onChange={(v) => setSide(v as Side)}
          options={["long", "short"]}
        />
        <NumField label="Contracts" value={contracts} onChange={setContracts} step={1} min={1} />
        <NumField label="Entry" value={entry} onChange={setEntry} step={0.25} />
        <NumField label="Stop" value={stop} onChange={setStop} step={0.25} placeholder="0 = none" />
        <NumField label="Exit" value={exitV} onChange={setExitV} step={0.25} placeholder="0 = open" />
        <TextField label="Setup" value={setup} onChange={setSetup} placeholder="e.g. IB break" />
        <TextField label="Tags" value={tagsText} onChange={setTagsText} placeholder="comma,separated" />
      </div>
      <textarea
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        placeholder="Notes (what worked, what didn't)…"
        rows={2}
        className="w-full text-xs bg-white/[0.02] border border-white/[0.04] rounded-md px-2 py-1.5 text-text-primary placeholder:text-text-muted/50 outline-none focus:border-accent/40 resize-none"
      />
      <div className="flex justify-end gap-1.5">
        <button
          onClick={onCancel}
          className="text-2xs uppercase tracking-[0.12em] px-2 py-1 rounded-md text-text-muted hover:text-text-secondary"
        >
          Cancel
        </button>
        <button
          onClick={handleSave}
          className="text-2xs uppercase tracking-[0.12em] px-3 py-1 rounded-md bg-accent text-white hover:bg-accent/80 font-medium"
        >
          {initial ? "Save" : "Add Trade"}
        </button>
      </div>
    </div>
  );
}

function SelectField({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: string[];
}) {
  return (
    <label className="flex flex-col gap-1 rounded-md bg-white/[0.02] border border-white/[0.04] px-2 py-1.5">
      <span className="text-2xs uppercase tracking-[0.12em] text-text-muted">{label}</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="bg-transparent text-xs text-text-primary outline-none"
      >
        {options.map((o) => (
          <option key={o} value={o} className="bg-bg-panel">
            {o}
          </option>
        ))}
      </select>
    </label>
  );
}

function NumField({
  label,
  value,
  onChange,
  step = 1,
  min,
  placeholder,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  step?: number;
  min?: number;
  placeholder?: string;
}) {
  return (
    <label className="flex flex-col gap-1 rounded-md bg-white/[0.02] border border-white/[0.04] px-2 py-1.5">
      <span className="text-2xs uppercase tracking-[0.12em] text-text-muted">{label}</span>
      <input
        type="number"
        value={Number.isFinite(value) ? value : 0}
        step={step}
        min={min}
        placeholder={placeholder}
        onChange={(e) => {
          const v = parseFloat(e.target.value);
          onChange(Number.isFinite(v) ? v : 0);
        }}
        className="bg-transparent text-xs font-mono tabular-nums text-text-primary outline-none"
      />
    </label>
  );
}

function TextField({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  return (
    <label className="flex flex-col gap-1 rounded-md bg-white/[0.02] border border-white/[0.04] px-2 py-1.5">
      <span className="text-2xs uppercase tracking-[0.12em] text-text-muted">{label}</span>
      <input
        type="text"
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className="bg-transparent text-xs text-text-primary placeholder:text-text-muted/50 outline-none"
      />
    </label>
  );
}
