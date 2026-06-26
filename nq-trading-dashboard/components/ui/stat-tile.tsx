import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type Tone = "default" | "bull" | "bear" | "warn" | "info";

interface Props {
  label: string;
  value: ReactNode;
  tone?: Tone;
  hint?: ReactNode;
  className?: string;
}

const TONE: Record<Tone, string> = {
  default: "text-text-primary",
  bull: "text-bull",
  bear: "text-bear",
  warn: "text-warn",
  info: "text-info",
};

export function StatTile({ label, value, tone = "default", hint, className }: Props) {
  return (
    <div
      className={cn(
        "flex flex-col gap-0.5 rounded-lg px-2.5 py-2 bg-white/[0.02] border border-white/[0.04]",
        className,
      )}
    >
      <div className="text-2xs uppercase tracking-[0.12em] text-text-muted">{label}</div>
      <div className={cn("font-mono tabular-nums text-sm", TONE[tone])}>{value}</div>
      {hint && <div className="text-2xs text-text-muted">{hint}</div>}
    </div>
  );
}
