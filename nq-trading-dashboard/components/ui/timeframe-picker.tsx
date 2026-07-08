import type { Timeframe } from "@/lib/types";
import { cn } from "@/lib/utils";

const TFS: Timeframe[] = ["1m", "5m", "15m", "1H", "4H", "D"];

interface Props {
  value: Timeframe;
  onChange: (v: Timeframe) => void;
  options?: Timeframe[];
}

export function TimeframePicker({ value, onChange, options = TFS }: Props) {
  return (
    <div className="flex gap-0.5 rounded-md bg-white/[0.04] p-0.5">
      {options.map((tf) => (
        <button
          key={tf}
          onClick={() => onChange(tf)}
          className={cn(
            "px-2 py-0.5 text-2xs font-medium rounded",
            value === tf
              ? "bg-white/10 text-text-primary"
              : "text-text-muted hover:text-text-secondary",
          )}
        >
          {tf}
        </button>
      ))}
    </div>
  );
}
