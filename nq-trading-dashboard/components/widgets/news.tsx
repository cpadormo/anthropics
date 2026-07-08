"use client";

import { ExternalLink } from "lucide-react";
import { GlassCard } from "../ui/glass-card";
import { useNews } from "@/lib/hooks/use-news";
import type { NewsRelevance } from "@/lib/data/news";
import { cn } from "@/lib/utils";

const LABEL: Record<NewsRelevance, string> = {
  fed: "Fed",
  inflation: "Inflation",
  treasury: "Treasury",
  semis: "Semis",
  tech: "Tech",
  geopolitics: "Geopol",
  breaking: "Breaking",
  other: "",
};

const COLOR: Record<NewsRelevance, string> = {
  fed: "bg-warn-soft text-warn border border-warn/30",
  inflation: "bg-bear-soft text-bear border border-bear/30",
  treasury: "bg-info-soft text-info border border-info/30",
  semis: "bg-accent-soft text-accent border border-accent/30",
  tech: "bg-accent-soft text-accent border border-accent/30",
  geopolitics: "bg-bear-soft text-bear border border-bear/30",
  breaking: "bg-bear text-white",
  other: "",
};

export function NewsWidget() {
  const { items, demo } = useNews();
  return (
    <GlassCard
      title="News Feed"
      subtitle="Market-moving only"
      actions={
        demo ? (
          <span
            className="text-2xs uppercase tracking-[0.12em] px-1.5 py-0.5 rounded bg-warn-soft text-warn border border-warn/30"
            title="Set FINNHUB_API_KEY in .env.local for live news"
          >
            demo
          </span>
        ) : null
      }
    >
      {!items.length ? (
        <div className="text-text-muted text-sm">Loading…</div>
      ) : (
        <ul className="flex flex-col divide-y divide-white/[0.04]">
          {items.map((n) => (
            <li key={n.id} className="py-2 flex flex-col gap-1">
              <div className="flex items-baseline gap-2 text-2xs">
                <span className="font-mono tabular-nums text-text-muted">{fmtAgo(n.ts)}</span>
                <span className="text-text-muted truncate min-w-0">{n.source}</span>
                {n.relevance !== "other" && (
                  <span
                    className={cn(
                      "ml-auto px-1.5 py-0.5 rounded uppercase font-medium tracking-wide flex-shrink-0",
                      COLOR[n.relevance],
                    )}
                  >
                    {LABEL[n.relevance]}
                  </span>
                )}
              </div>
              <a
                href={n.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-text-primary hover:text-accent flex items-start gap-1.5 transition-colors"
              >
                <span className="flex-1 leading-snug">{n.headline}</span>
                <ExternalLink size={11} className="mt-1 flex-shrink-0 text-text-muted" />
              </a>
            </li>
          ))}
        </ul>
      )}
    </GlassCard>
  );
}

function fmtAgo(ts: number): string {
  const sec = Math.max(0, Math.floor((Date.now() - ts) / 1000));
  if (sec < 60) return `${sec}s`;
  if (sec < 3600) return `${Math.floor(sec / 60)}m`;
  if (sec < 86400) return `${Math.floor(sec / 3600)}h`;
  return `${Math.floor(sec / 86400)}d`;
}
