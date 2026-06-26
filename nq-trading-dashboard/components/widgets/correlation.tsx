"use client";

import { useMemo } from "react";
import { GlassCard } from "../ui/glass-card";
import { useCorrelations } from "@/lib/hooks/use-correlations";
import { cn } from "@/lib/utils";

export function CorrelationWidget() {
  const { symbols, cells } = useCorrelations();

  const lookup = useMemo(() => {
    const m = new Map<string, number>();
    for (const c of cells) m.set(`${c.symbolA}|${c.symbolB}`, c.correlation);
    return m;
  }, [cells]);

  if (!cells.length) {
    return (
      <GlassCard title="Correlations" subtitle="5m log returns · last 60 bars">
        <div className="text-text-muted text-sm">Loading…</div>
      </GlassCard>
    );
  }

  return (
    <GlassCard
      title="Correlations"
      subtitle="5m log returns · last 60 bars"
      actions={<Legend />}
    >
      <div className="overflow-auto">
        <table className="text-2xs font-mono tabular-nums border-separate" style={{ borderSpacing: 2 }}>
          <thead>
            <tr>
              <th />
              {symbols.map((s) => (
                <th key={s} className="px-1 py-1 text-text-muted font-medium">
                  {s}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {symbols.map((a) => (
              <tr key={a}>
                <td className="px-1 py-1 text-text-muted text-right font-medium">{a}</td>
                {symbols.map((b) => {
                  const c = lookup.get(`${a}|${b}`) ?? 0;
                  const same = a === b;
                  const intensity = Math.min(1, Math.abs(c));
                  const bg = same
                    ? "rgba(255,255,255,0.04)"
                    : c >= 0
                      ? `rgba(34,197,94,${0.08 + intensity * 0.55})`
                      : `rgba(239,68,68,${0.08 + intensity * 0.55})`;
                  return (
                    <td
                      key={b}
                      className={cn(
                        "px-1 py-1 text-center rounded",
                        same ? "text-text-muted" : "text-text-primary",
                      )}
                      style={{ background: bg, minWidth: 38 }}
                      title={`corr(${a}, ${b}) = ${c.toFixed(3)}`}
                    >
                      {same ? "—" : c.toFixed(2)}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </GlassCard>
  );
}

function Legend() {
  return (
    <div className="flex items-center gap-2 text-2xs text-text-muted">
      <span>−1</span>
      <span
        className="h-2 w-16 rounded-sm"
        style={{
          background:
            "linear-gradient(90deg, rgba(239,68,68,0.7) 0%, rgba(255,255,255,0.06) 50%, rgba(34,197,94,0.7) 100%)",
        }}
      />
      <span>+1</span>
    </div>
  );
}
