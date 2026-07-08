import type { LucideIcon } from "lucide-react";

export function StatCard({
  label,
  value,
  hint,
  icon: Icon,
  accent,
}: {
  label: string;
  value: string | number;
  hint?: string;
  icon: LucideIcon;
  accent?: string;
}) {
  return (
    <div className="card p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-xs font-medium uppercase tracking-wide" style={{ color: "var(--text-soft)" }}>
            {label}
          </div>
          <div className="mt-2 text-3xl font-semibold tabular-nums">{value}</div>
          {hint && (
            <div className="mt-1 text-xs" style={{ color: "var(--text-soft)" }}>
              {hint}
            </div>
          )}
        </div>
        <div
          className="grid h-9 w-9 place-items-center rounded-md"
          style={{ background: accent ?? "var(--accent-soft)", color: "var(--accent)" }}
        >
          <Icon className="h-4 w-4" />
        </div>
      </div>
    </div>
  );
}
