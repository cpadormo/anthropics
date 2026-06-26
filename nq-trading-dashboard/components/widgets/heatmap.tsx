"use client";

import { GlassCard } from "../ui/glass-card";
import { useHeatmap } from "@/lib/hooks/use-heatmap";
import type { HeatmapCell } from "@/lib/data/heatmap";
import { cn, fmtPct } from "@/lib/utils";

export function HeatmapWidget() {
  const groups = useHeatmap();
  return (
    <GlassCard
      title="Heatmaps"
      subtitle="Sectors · Magnificent 7 · Semis"
      actions={
        <span
          className="text-2xs uppercase tracking-[0.12em] px-1.5 py-0.5 rounded bg-warn-soft text-warn border border-warn/30"
          title="Constituent quotes will route through Polygon or IEX in V5"
        >
          demo
        </span>
      }
    >
      <div className="space-y-3">
        {groups.map((g) => (
          <div key={g.id}>
            <div className="text-2xs uppercase tracking-[0.12em] text-text-muted mb-1.5">
              {g.label}
            </div>
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-1">
              {g.cells.map((c) => (
                <Tile key={c.symbol} cell={c} />
              ))}
            </div>
          </div>
        ))}
      </div>
    </GlassCard>
  );
}

function Tile({ cell }: { cell: HeatmapCell }) {
  const intensity = Math.min(1, Math.abs(cell.changePct) / 3);
  const bg =
    cell.changePct >= 0
      ? `rgba(34,197,94,${0.12 + intensity * 0.5})`
      : `rgba(239,68,68,${0.12 + intensity * 0.5})`;
  const txt = cell.changePct >= 0 ? "text-bull" : "text-bear";
  return (
    <div
      className="rounded-md px-2 py-1.5 flex flex-col"
      style={{ background: bg }}
      title={`${cell.name}${cell.marketCapBn ? ` · $${cell.marketCapBn}B` : ""}`}
    >
      <div className="text-xs font-mono text-text-primary">{cell.symbol}</div>
      <div className="text-2xs text-text-secondary truncate">{cell.name}</div>
      <div className={cn("text-xs font-mono tabular-nums mt-0.5", txt)}>
        {fmtPct(cell.changePct)}
      </div>
    </div>
  );
}
