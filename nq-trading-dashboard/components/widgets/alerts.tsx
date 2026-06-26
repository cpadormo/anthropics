"use client";

import { useEffect, useState } from "react";
import { Bell, BellOff, Plus, RotateCcw, Trash2, X } from "lucide-react";
import { GlassCard } from "../ui/glass-card";
import { useAlerts } from "@/lib/hooks/use-alerts";
import {
  newAlert,
  type Alert,
  type AlertChannel,
  type AlertCondition,
} from "@/lib/data/alerts";
import { INSTRUMENTS, OVERVIEW_SYMBOLS } from "@/lib/instruments";
import { cn, fmtPrice } from "@/lib/utils";

const ALL_CHANNELS: AlertChannel[] = ["browser", "discord", "sms"];

export function AlertsWidget() {
  const { alerts, add, update, remove } = useAlerts();
  const [showForm, setShowForm] = useState(false);
  const [perm, setPerm] = useState<NotificationPermission | "unsupported">("default");

  useEffect(() => {
    if (typeof Notification === "undefined") setPerm("unsupported");
    else setPerm(Notification.permission);
  }, []);

  async function requestPerm() {
    if (typeof Notification === "undefined") return;
    const p = await Notification.requestPermission();
    setPerm(p);
  }

  const active = alerts.filter((a) => a.active && !a.triggered).length;

  return (
    <GlassCard
      title="Alerts"
      subtitle={`${active} armed · ${alerts.length - active} idle`}
      actions={
        <div className="flex items-center gap-1">
          <PermPill state={perm} onRequest={requestPerm} />
          {!showForm && (
            <button
              onClick={() => setShowForm(true)}
              className="flex items-center gap-1 text-2xs uppercase tracking-[0.12em] px-2 py-1 rounded-md bg-accent/15 text-accent border border-accent/30 hover:bg-accent/25"
            >
              <Plus size={11} /> Add
            </button>
          )}
        </div>
      }
    >
      {showForm && (
        <AlertForm
          onSave={(a) => {
            add(a);
            setShowForm(false);
          }}
          onCancel={() => setShowForm(false)}
        />
      )}

      {alerts.length === 0 && !showForm ? (
        <div className="text-text-muted text-sm py-6 text-center">
          No alerts. Click <span className="text-text-secondary">Add</span> to set a price trigger.
        </div>
      ) : (
        <ul className="divide-y divide-white/[0.04]">
          {alerts.map((a) => (
            <AlertRow
              key={a.id}
              alert={a}
              onToggle={() => update(a.id, { ...a, active: !a.active })}
              onReset={() =>
                update(a.id, { ...a, triggered: false, triggeredAt: null, active: true })
              }
              onRemove={() => remove(a.id)}
            />
          ))}
        </ul>
      )}
    </GlassCard>
  );
}

function AlertRow({
  alert,
  onToggle,
  onReset,
  onRemove,
}: {
  alert: Alert;
  onToggle: () => void;
  onReset: () => void;
  onRemove: () => void;
}) {
  const dec = INSTRUMENTS[alert.symbol]?.priceDecimals ?? 2;
  const stateTone = alert.triggered
    ? "text-warn"
    : alert.active
      ? "text-bull"
      : "text-text-muted";
  const stateLabel = alert.triggered ? "FIRED" : alert.active ? "ARMED" : "OFF";
  return (
    <li className="group py-1.5 flex items-center gap-2 text-xs">
      <span
        className={cn(
          "font-mono uppercase text-2xs tracking-[0.12em] w-12",
          stateTone,
        )}
      >
        {stateLabel}
      </span>
      <span className="font-mono text-text-primary w-12">{alert.symbol}</span>
      <span
        className={cn(
          "font-mono uppercase text-2xs w-12",
          alert.condition === "above" ? "text-bull" : "text-bear",
        )}
      >
        {alert.condition === "above" ? "↑ >=" : "↓ <="}
      </span>
      <span className="font-mono tabular-nums text-text-primary w-20">
        {fmtPrice(alert.price, dec)}
      </span>
      <span className="flex items-center gap-0.5 flex-1 min-w-0">
        {alert.channels.map((c) => (
          <span
            key={c}
            className="text-2xs uppercase tracking-[0.12em] px-1 py-0.5 rounded bg-white/[0.04] text-text-muted"
          >
            {c}
          </span>
        ))}
      </span>
      {alert.note && (
        <span className="text-text-secondary truncate text-2xs" title={alert.note}>
          {alert.note}
        </span>
      )}
      <div className="opacity-0 group-hover:opacity-100 flex items-center gap-1">
        {alert.triggered && (
          <button
            onClick={onReset}
            className="text-text-muted hover:text-bull px-1"
            title="Re-arm"
          >
            <RotateCcw size={12} />
          </button>
        )}
        <button
          onClick={onToggle}
          className="text-text-muted hover:text-text-secondary px-1"
          title={alert.active ? "Disable" : "Enable"}
        >
          {alert.active ? <BellOff size={12} /> : <Bell size={12} />}
        </button>
        <button
          onClick={onRemove}
          className="text-text-muted hover:text-bear px-1"
          title="Delete"
        >
          <Trash2 size={12} />
        </button>
      </div>
    </li>
  );
}

function AlertForm({
  onSave,
  onCancel,
}: {
  onSave: (a: Alert) => void;
  onCancel: () => void;
}) {
  const [symbol, setSymbol] = useState("NQ");
  const [condition, setCondition] = useState<AlertCondition>("above");
  const [price, setPrice] = useState<number>(0);
  const [note, setNote] = useState("");
  const [channels, setChannels] = useState<AlertChannel[]>(["browser"]);

  function toggleChannel(c: AlertChannel) {
    setChannels((cur) =>
      cur.includes(c) ? cur.filter((x) => x !== c) : [...cur, c],
    );
  }

  function handleSave() {
    if (!price) return;
    onSave(newAlert({ symbol, condition, price, channels, note }));
  }

  return (
    <div className="rounded-lg border border-accent/30 bg-accent/[0.04] p-3 mb-2 space-y-2">
      <div className="flex items-center justify-between">
        <div className="text-xs font-medium text-text-primary">New Alert</div>
        <button
          onClick={onCancel}
          className="text-text-muted hover:text-text-secondary"
        >
          <X size={14} />
        </button>
      </div>
      <div className="grid grid-cols-3 gap-1.5">
        <label className="flex flex-col gap-1 rounded-md bg-white/[0.02] border border-white/[0.04] px-2 py-1.5">
          <span className="text-2xs uppercase tracking-[0.12em] text-text-muted">Symbol</span>
          <select
            value={symbol}
            onChange={(e) => setSymbol(e.target.value)}
            className="bg-transparent text-xs text-text-primary outline-none"
          >
            {OVERVIEW_SYMBOLS.map((s) => (
              <option key={s} value={s} className="bg-bg-panel">
                {s}
              </option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-1 rounded-md bg-white/[0.02] border border-white/[0.04] px-2 py-1.5">
          <span className="text-2xs uppercase tracking-[0.12em] text-text-muted">Condition</span>
          <select
            value={condition}
            onChange={(e) => setCondition(e.target.value as AlertCondition)}
            className="bg-transparent text-xs text-text-primary outline-none"
          >
            <option value="above" className="bg-bg-panel">crosses above</option>
            <option value="below" className="bg-bg-panel">crosses below</option>
          </select>
        </label>
        <label className="flex flex-col gap-1 rounded-md bg-white/[0.02] border border-white/[0.04] px-2 py-1.5">
          <span className="text-2xs uppercase tracking-[0.12em] text-text-muted">Price</span>
          <input
            type="number"
            value={price || ""}
            step={0.25}
            onChange={(e) => {
              const v = parseFloat(e.target.value);
              setPrice(Number.isFinite(v) ? v : 0);
            }}
            className="bg-transparent text-xs font-mono tabular-nums text-text-primary outline-none"
          />
        </label>
      </div>
      <input
        value={note}
        onChange={(e) => setNote(e.target.value)}
        placeholder="Optional note (e.g. fade resistance)"
        className="w-full text-xs bg-white/[0.02] border border-white/[0.04] rounded-md px-2 py-1.5 text-text-primary placeholder:text-text-muted/50 outline-none focus:border-accent/40"
      />
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-1">
          {ALL_CHANNELS.map((c) => (
            <button
              key={c}
              onClick={() => toggleChannel(c)}
              className={cn(
                "px-2 py-0.5 text-2xs uppercase tracking-[0.12em] rounded border transition-colors",
                channels.includes(c)
                  ? "border-accent/40 bg-accent/15 text-text-primary"
                  : "border-white/5 bg-white/[0.02] text-text-muted hover:border-white/15",
              )}
            >
              {c}
            </button>
          ))}
        </div>
        <div className="flex gap-1.5">
          <button
            onClick={onCancel}
            className="text-2xs uppercase tracking-[0.12em] px-2 py-1 rounded-md text-text-muted hover:text-text-secondary"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={!price}
            className="text-2xs uppercase tracking-[0.12em] px-3 py-1 rounded-md bg-accent text-white hover:bg-accent/80 font-medium disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Arm Alert
          </button>
        </div>
      </div>
    </div>
  );
}

function PermPill({
  state,
  onRequest,
}: {
  state: NotificationPermission | "unsupported";
  onRequest: () => void;
}) {
  if (state === "unsupported") return null;
  if (state === "granted") {
    return (
      <span className="text-2xs uppercase tracking-[0.12em] px-1.5 py-1 rounded bg-bull-soft text-bull border border-bull/30">
        Notifications on
      </span>
    );
  }
  if (state === "denied") {
    return (
      <span className="text-2xs uppercase tracking-[0.12em] px-1.5 py-1 rounded bg-bear-soft text-bear border border-bear/30">
        Notifications blocked
      </span>
    );
  }
  return (
    <button
      onClick={onRequest}
      className="text-2xs uppercase tracking-[0.12em] px-1.5 py-1 rounded bg-warn-soft text-warn border border-warn/30 hover:bg-warn/20"
    >
      Enable notifications
    </button>
  );
}
