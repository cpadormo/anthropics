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
}

const SPEC: Record<string, ContractSpec> = {
  NQ:  { tickSize: 0.25, tickValue: 5,    pointValue: 20,  display: "E-mini Nasdaq" },
  MNQ: { tickSize: 0.25, tickValue: 0.5,  pointValue: 2,   display: "Micro Nasdaq" },
  ES:  { tickSize: 0.25, tickValue: 12.5, pointValue: 50,  display: "E-mini S&P" },
  MES: { tickSize: 0.25, tickValue: 1.25, pointValue: 5,   display: "Micro S&P" },
  RTY: { tickSize: 0.10, tickValue: 5,    pointValue: 50,  display: "E-mini Russell" },
  M2K: { tickSize: 0.10, tickValue: 0.5,  pointValue: 5,   display: "Micro Russell" },
  YM:  { tickSize: 1,    tickValue: 5,    pointValue: 5,   display: "E-mini Dow" },
  MYM: { tickSize: 1,    tickValue: 0.5,  pointValue: 0.5, display: "Micro Dow" },
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
    <GlassCard title="Position Size Calculator" subtitle="Fixed-fractional risk model">
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
      </div>
    </GlassCard>
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
