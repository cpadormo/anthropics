"use client";

import { useMemo, useState } from "react";
import { GlassCard } from "../ui/glass-card";
import { StatTile } from "../ui/stat-tile";
import { cn } from "@/lib/utils";

const INSTRUMENT_OPTIONS = ["NQ", "MNQ", "ES", "MES", "RTY", "M2K", "YM", "MYM"];

interface ContractSpec {
  tickSize: number;
  tickValue: number;
  pointValue: number;
  display: string;
  root: string; // CME root for front-month resolution at the broker
}

const SPEC: Record<string, ContractSpec> = {
  NQ:  { tickSize: 0.25, tickValue: 5,    pointValue: 20,  display: "E-mini Nasdaq",  root: "NQ" },
  MNQ: { tickSize: 0.25, tickValue: 0.5,  pointValue: 2,   display: "Micro Nasdaq",   root: "MNQ" },
  ES:  { tickSize: 0.25, tickValue: 12.5, pointValue: 50,  display: "E-mini S&P",     root: "ES" },
  MES: { tickSize: 0.25, tickValue: 1.25, pointValue: 5,   display: "Micro S&P",      root: "MES" },
  RTY: { tickSize: 0.10, tickValue: 5,    pointValue: 50,  display: "E-mini Russell", root: "RTY" },
  M2K: { tickSize: 0.10, tickValue: 0.5,  pointValue: 5,   display: "Micro Russell",  root: "M2K" },
  YM:  { tickSize: 1,    tickValue: 5,    pointValue: 5,   display: "E-mini Dow",     root: "YM" },
  MYM: { tickSize: 1,    tickValue: 0.5,  pointValue: 0.5, display: "Micro Dow",      root: "MYM" },
};

export function PositionCalculator() {
  const [account, setAccount] = useState(25000);
  const [riskPct, setRiskPct] = useState(0.5);
  const [stopTicks, setStopTicks] = useState(40);
  const [rr, setRr] = useState(2);
  const [symbol, setSymbol] = useState("NQ");

  const spec = SPEC[symbol];

  const calc = useMemo(() => {
    const dollarRisk = account * (riskPct / 100);
    const riskPerContract = stopTicks * spec.tickValue;
    const contracts =
      riskPerContract > 0 ? Math.max(0, Math.floor(dollarRisk / riskPerContract)) : 0;
    const totalRisk = contracts * riskPerContract;
    const target = contracts * riskPerContract * rr;
    const stopPoints = stopTicks * spec.tickSize;
    const targetPoints = stopPoints * rr;
    return { dollarRisk, riskPerContract, contracts, totalRisk, target, stopPoints, targetPoints };
  }, [account, riskPct, stopTicks, rr, spec]);

  return (
    <GlassCard title="Position Size Calculator" subtitle="Fixed-fractional + broker entry">
      <div className="space-y-3">
        <div className="grid grid-cols-2 gap-2">
          <NumberField label="Account Size ($)" value={account} onChange={setAccount} step={100} min={0} />
          <NumberField label="Risk per Trade (%)" value={riskPct} onChange={setRiskPct} step={0.05} min={0.01} max={5} />
          <NumberField label="Stop Distance (ticks)" value={stopTicks} onChange={setStopTicks} step={1} min={1} />
          <NumberField label="Target R:R" value={rr} onChange={setRr} step={0.25} min={0.5} />
        </div>

        <div>
          <div className="text-2xs uppercase tracking-[0.14em] text-text-muted mb-1.5">Instrument</div>
          <div className="grid grid-cols-4 gap-1">
            {INSTRUMENT_OPTIONS.map((s) => (
              <button
                key={s}
                onClick={() => setSymbol(s)}
                className={cn(
                  "py-1.5 text-xs font-mono rounded-md border transition-colors",
                  symbol === s
                    ? "border-accent/40 bg-accent/15 text-text-primary"
                    : "border-white/5 bg-white/[0.02] text-text-secondary hover:border-white/15",
                )}
              >
                {s}
              </button>
            ))}
          </div>
          <div className="text-2xs text-text-muted mt-1">
            {spec.display} · ${spec.tickValue.toFixed(2)}/tick · ${spec.pointValue}/pt
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2 pt-1">
          <StatTile label="Dollar Risk" value={`$${calc.dollarRisk.toFixed(2)}`} tone="warn" />
          <StatTile label="Risk / Contract" value={`$${calc.riskPerContract.toFixed(2)}`} />
          <StatTile
            label="Contracts"
            value={calc.contracts.toString()}
            tone={calc.contracts === 0 ? "bear" : "bull"}
            hint={calc.contracts === 0 ? "Stop too wide for risk" : `Stop ${calc.stopPoints} pts`}
          />
          <StatTile label="Total at Risk" value={`$${calc.totalRisk.toFixed(2)}`} tone="bear" />
          <StatTile
            label="Target $"
            value={`$${calc.target.toFixed(2)}`}
            tone="bull"
            hint={`${calc.targetPoints} pts`}
          />
          <StatTile label="R : R" value={`${rr.toFixed(2)} : 1`} tone="info" />
        </div>

        <OrderEntry root={spec.root} contracts={calc.contracts} />
      </div>
    </GlassCard>
  );
}

function OrderEntry({ root, contracts }: { root: string; contracts: number }) {
  const enabled = process.env.NEXT_PUBLIC_DATA_PROVIDER === "tradovate";
  const [action, setAction] = useState<"Buy" | "Sell">("Buy");
  const [orderType, setOrderType] = useState<"Market" | "Limit" | "Stop">("Market");
  const [price, setPrice] = useState<number>(0);
  const [staged, setStaged] = useState(false);
  const [status, setStatus] = useState<"idle" | "sending" | "ok" | "error">("idle");
  const [statusDetail, setStatusDetail] = useState<string>("");

  const canStage =
    enabled &&
    contracts > 0 &&
    (orderType === "Market" || price > 0);

  async function submit() {
    setStatus("sending");
    setStatusDetail("");
    try {
      const res = await fetch("/api/tradovate/order/place", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          symbol: root,
          action,
          orderQty: contracts,
          orderType,
          ...(orderType === "Limit" && { price }),
          ...(orderType === "Stop" && { stopPrice: price }),
        }),
      });
      const data = await res.json();
      if (res.ok && data.ok) {
        setStatus("ok");
        setStatusDetail(`Order ${data.order?.orderId ?? "✓"} · ${data.contract}`);
        setStaged(false);
      } else {
        setStatus("error");
        setStatusDetail(data?.error ?? `HTTP ${res.status}`);
      }
    } catch (err) {
      setStatus("error");
      setStatusDetail((err as Error).message);
    }
  }

  return (
    <div className="rounded-lg border border-warn/30 bg-warn-soft p-2.5 space-y-2">
      <div className="flex items-center justify-between">
        <div className="text-2xs uppercase tracking-[0.12em] text-warn font-medium">
          Order Entry · Tradovate
        </div>
        {!enabled && (
          <span className="text-2xs text-text-muted">
            requires NEXT_PUBLIC_DATA_PROVIDER=tradovate
          </span>
        )}
      </div>
      <div className="grid grid-cols-3 gap-1">
        <button
          onClick={() => setAction("Buy")}
          disabled={!enabled}
          className={cn(
            "py-1.5 text-xs font-mono uppercase rounded-md border transition-colors",
            action === "Buy"
              ? "border-bull/50 bg-bull/15 text-bull"
              : "border-white/5 bg-white/[0.02] text-text-muted hover:border-white/15",
            !enabled && "opacity-40 cursor-not-allowed",
          )}
        >
          Buy
        </button>
        <button
          onClick={() => setAction("Sell")}
          disabled={!enabled}
          className={cn(
            "py-1.5 text-xs font-mono uppercase rounded-md border transition-colors",
            action === "Sell"
              ? "border-bear/50 bg-bear/15 text-bear"
              : "border-white/5 bg-white/[0.02] text-text-muted hover:border-white/15",
            !enabled && "opacity-40 cursor-not-allowed",
          )}
        >
          Sell
        </button>
        <select
          value={orderType}
          onChange={(e) => setOrderType(e.target.value as any)}
          disabled={!enabled}
          className="bg-white/[0.02] border border-white/5 rounded-md text-xs text-text-primary px-2 outline-none disabled:opacity-40"
        >
          <option value="Market" className="bg-bg-panel">Market</option>
          <option value="Limit" className="bg-bg-panel">Limit</option>
          <option value="Stop" className="bg-bg-panel">Stop</option>
        </select>
      </div>
      {orderType !== "Market" && (
        <input
          type="number"
          step={0.25}
          value={price || ""}
          onChange={(e) => setPrice(parseFloat(e.target.value) || 0)}
          placeholder={`${orderType} price`}
          disabled={!enabled}
          className="w-full text-xs font-mono tabular-nums bg-white/[0.02] border border-white/5 rounded-md px-2 py-1.5 text-text-primary placeholder:text-text-muted/50 outline-none focus:border-warn/40 disabled:opacity-40"
        />
      )}
      {!staged ? (
        <button
          onClick={() => setStaged(true)}
          disabled={!canStage}
          className="w-full py-1.5 text-2xs uppercase tracking-[0.12em] rounded-md bg-warn/15 text-warn border border-warn/30 hover:bg-warn/25 font-medium disabled:opacity-40 disabled:cursor-not-allowed"
        >
          Stage Order
        </button>
      ) : (
        <div className="space-y-1.5">
          <div className="text-xs text-text-secondary text-center font-mono">
            {action} {contracts} × {root} · {orderType}
            {orderType !== "Market" && ` @ ${price}`}
          </div>
          <div className="grid grid-cols-2 gap-1">
            <button
              onClick={() => setStaged(false)}
              className="py-1.5 text-2xs uppercase tracking-[0.12em] rounded-md text-text-muted hover:text-text-secondary border border-white/5"
            >
              Cancel
            </button>
            <button
              onClick={submit}
              disabled={status === "sending"}
              className={cn(
                "py-1.5 text-2xs uppercase tracking-[0.12em] rounded-md font-medium",
                action === "Buy"
                  ? "bg-bull text-bg-base hover:bg-bull/80"
                  : "bg-bear text-white hover:bg-bear/80",
                status === "sending" && "opacity-60 cursor-wait",
              )}
            >
              {status === "sending" ? "Sending…" : `Send ${action}`}
            </button>
          </div>
        </div>
      )}
      {status !== "idle" && status !== "sending" && statusDetail && (
        <div
          className={cn(
            "text-2xs px-2 py-1.5 rounded font-mono",
            status === "ok"
              ? "bg-bull-soft text-bull border border-bull/30"
              : "bg-bear-soft text-bear border border-bear/30",
          )}
        >
          {status === "ok" ? "✓ " : "✗ "}
          {statusDetail}
        </div>
      )}
    </div>
  );
}

function NumberField({
  label,
  value,
  onChange,
  step = 1,
  min,
  max,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  step?: number;
  min?: number;
  max?: number;
}) {
  return (
    <label className="flex flex-col gap-1 rounded-lg px-2.5 py-2 bg-white/[0.02] border border-white/[0.04] focus-within:border-accent/40">
      <span className="text-2xs uppercase tracking-[0.12em] text-text-muted">{label}</span>
      <input
        type="number"
        value={Number.isFinite(value) ? value : 0}
        step={step}
        min={min}
        max={max}
        onChange={(e) => {
          const v = parseFloat(e.target.value);
          if (Number.isFinite(v)) onChange(v);
        }}
        className="bg-transparent font-mono tabular-nums text-sm text-text-primary outline-none"
      />
    </label>
  );
}
