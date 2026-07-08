import { ArrowDownRight, ArrowUpRight, Minus } from "lucide-react";
import type { Instrument, Quote } from "@/lib/types";
import { cn, fmtPct, fmtPrice, fmtSigned } from "@/lib/utils";
import { Sparkline } from "./sparkline";

interface Props {
  quote: Quote | null;
  instrument: Instrument;
  compact?: boolean;
}

export function PriceCell({ quote, instrument, compact }: Props) {
  const dec = instrument.priceDecimals;

  if (!quote) {
    return (
      <div className="flex items-center justify-between gap-3 px-3 py-2 rounded-xl bg-white/[0.02] border border-white/[0.04]">
        <div className="text-text-muted text-sm">{instrument.display}</div>
        <div className="text-text-muted text-xs animate-pulseSoft">loading…</div>
      </div>
    );
  }

  const up = quote.change > 0;
  const flat = quote.change === 0;
  const tone = flat ? "text-text-secondary" : up ? "text-bull" : "text-bear";
  const Icon = flat ? Minus : up ? ArrowUpRight : ArrowDownRight;

  return (
    <div className="group flex items-center justify-between gap-3 px-3 py-2 rounded-xl bg-white/[0.02] border border-white/[0.04] hover:border-white/10 hover:bg-white/[0.035] transition-colors">
      <div className="min-w-0">
        <div className="flex items-baseline gap-1.5">
          <div className="font-mono text-[13px] text-text-primary tracking-tight">{instrument.display}</div>
          <div className="text-2xs text-text-muted truncate">{instrument.name}</div>
        </div>
        <div className="mt-0.5 font-mono text-base text-text-primary tabular-nums">
          {fmtPrice(quote.last, dec)}
        </div>
      </div>

      {!compact && <Sparkline data={quote.series} width={70} height={26} />}

      <div className={cn("flex flex-col items-end font-mono text-xs tabular-nums", tone)}>
        <div className="flex items-center gap-0.5">
          <Icon size={12} />
          <span>{fmtPct(quote.changePct)}</span>
        </div>
        <div className="text-text-muted">{fmtSigned(quote.change, dec)}</div>
      </div>
    </div>
  );
}
