"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import type { Layouts } from "react-grid-layout";
import "react-grid-layout/css/styles.css";
import "react-resizable/css/styles.css";

import { useDbMode } from "@/lib/hooks/use-db-mode";

import { AiInsightsWidget } from "../widgets/ai-insights";
import { AiSummaryWidget } from "../widgets/ai-summary";
import { AlertsWidget } from "../widgets/alerts";
import { AnalyticsWidget } from "../widgets/analytics";
import { BacktestWidget } from "../widgets/backtest";
import { CalendarWidget } from "../widgets/calendar";
import { ChartWidget } from "../widgets/chart";
import { CorrelationWidget } from "../widgets/correlation";
import { HeatmapWidget } from "../widgets/heatmap";
import { JournalWidget } from "../widgets/journal";
import { MarketInternals } from "../widgets/market-internals";
import { MarketOverview } from "../widgets/market-overview";
import { MultiTimeframeTrend } from "../widgets/mtf-trend";
import { NewsWidget } from "../widgets/news";
import { OptionsWidget } from "../widgets/options";
import { OvernightSession } from "../widgets/overnight-session";
import { PositionCalculator } from "../widgets/position-calculator";
import { SessionStats } from "../widgets/session-stats";
import { TradingChecklist } from "../widgets/trading-checklist";
import { TradingViewWidget } from "../widgets/tradingview";
import { VolatilityWidget } from "../widgets/volatility";
import { VolumeProfileWidget } from "../widgets/volume-profile";
import { Watchlist } from "../widgets/watchlist";

const ResponsiveGridLayout = dynamic(
  () => import("react-grid-layout").then((m) => m.WidthProvider(m.Responsive)),
  { ssr: false },
);

const COLS = { lg: 12, md: 10, sm: 6, xs: 4, xxs: 2 };
const BREAKPOINTS = { lg: 1400, md: 1100, sm: 800, xs: 540, xxs: 0 };

const DEFAULT_LAYOUTS: Layouts = {
  lg: [
    { i: "chart",       x: 0, y: 0,   w: 8, h: 20, minW: 6, minH: 16 },
    { i: "aiSummary",   x: 8, y: 0,   w: 4, h: 24, minW: 3, minH: 18 },
    { i: "insights",    x: 0, y: 20,  w: 4, h: 14, minW: 3, minH: 10 },
    { i: "market",      x: 4, y: 20,  w: 4, h: 14, minW: 3, minH: 10 },
    { i: "vprofile",    x: 8, y: 24,  w: 4, h: 16, minW: 3, minH: 14 },
    { i: "tradingview", x: 0, y: 34,  w: 8, h: 18, minW: 4, minH: 12 },
    { i: "alerts",      x: 8, y: 40,  w: 4, h: 14, minW: 3, minH: 8 },
    { i: "correlation", x: 0, y: 52,  w: 4, h: 12, minW: 3, minH: 10 },
    { i: "volatility",  x: 4, y: 52,  w: 4, h: 10, minW: 3, minH: 8 },
    { i: "mtfTrend",    x: 8, y: 54,  w: 4, h: 10, minW: 3, minH: 7 },
    { i: "internals",   x: 0, y: 64,  w: 4, h: 13, minW: 3, minH: 10 },
    { i: "overnight",   x: 4, y: 62,  w: 4, h: 14, minW: 3, minH: 8 },
    { i: "session",     x: 8, y: 64,  w: 4, h: 13, minW: 3, minH: 8 },
    { i: "options",     x: 0, y: 77,  w: 4, h: 14, minW: 3, minH: 10 },
    { i: "calendar",    x: 4, y: 76,  w: 8, h: 14, minW: 4, minH: 8 },
    { i: "news",        x: 0, y: 91,  w: 4, h: 15, minW: 3, minH: 8 },
    { i: "watchlist",   x: 4, y: 90,  w: 4, h: 14, minW: 3, minH: 6 },
    { i: "heatmap",     x: 8, y: 90,  w: 4, h: 20, minW: 3, minH: 14 },
    { i: "calculator",  x: 0, y: 106, w: 4, h: 18, minW: 3, minH: 14 },
    { i: "journal",     x: 4, y: 104, w: 8, h: 16, minW: 4, minH: 10 },
    { i: "analytics",   x: 0, y: 124, w: 12, h: 18, minW: 3, minH: 16 },
    { i: "backtest",    x: 0, y: 142, w: 12, h: 20, minW: 4, minH: 14 },
    { i: "checklist",   x: 0, y: 162, w: 12, h: 11, minW: 3, minH: 8 },
  ],
  md: [
    { i: "chart",       x: 0, y: 0,   w: 10, h: 20 },
    { i: "tradingview", x: 0, y: 20,  w: 10, h: 18 },
    { i: "aiSummary",   x: 0, y: 38,  w: 5,  h: 22 },
    { i: "insights",    x: 5, y: 38,  w: 5,  h: 14 },
    { i: "market",      x: 5, y: 52,  w: 5,  h: 12 },
    { i: "alerts",      x: 0, y: 60,  w: 5,  h: 14 },
    { i: "vprofile",    x: 5, y: 64,  w: 5,  h: 18 },
    { i: "correlation", x: 0, y: 74,  w: 5,  h: 12 },
    { i: "volatility",  x: 5, y: 82,  w: 5,  h: 10 },
    { i: "mtfTrend",    x: 0, y: 86,  w: 5,  h: 11 },
    { i: "internals",   x: 5, y: 92,  w: 5,  h: 13 },
    { i: "overnight",   x: 0, y: 97,  w: 5,  h: 13 },
    { i: "session",     x: 5, y: 105, w: 5,  h: 12 },
    { i: "options",     x: 0, y: 110, w: 5,  h: 14 },
    { i: "calendar",    x: 0, y: 124, w: 10, h: 14 },
    { i: "news",        x: 0, y: 138, w: 5,  h: 14 },
    { i: "watchlist",   x: 5, y: 138, w: 5,  h: 12 },
    { i: "heatmap",     x: 0, y: 152, w: 10, h: 20 },
    { i: "calculator",  x: 0, y: 172, w: 5,  h: 18 },
    { i: "journal",     x: 5, y: 172, w: 5,  h: 16 },
    { i: "analytics",   x: 0, y: 190, w: 10, h: 22 },
    { i: "backtest",    x: 0, y: 212, w: 10, h: 22 },
    { i: "checklist",   x: 0, y: 234, w: 10, h: 13 },
  ],
  sm: [
    { i: "chart",       x: 0, y: 0,   w: 6, h: 22 },
    { i: "tradingview", x: 0, y: 22,  w: 6, h: 20 },
    { i: "aiSummary",   x: 0, y: 42,  w: 6, h: 24 },
    { i: "insights",    x: 0, y: 66,  w: 6, h: 14 },
    { i: "market",      x: 0, y: 80,  w: 6, h: 14 },
    { i: "alerts",      x: 0, y: 94,  w: 6, h: 16 },
    { i: "calendar",    x: 0, y: 110, w: 6, h: 16 },
    { i: "news",        x: 0, y: 126, w: 6, h: 16 },
    { i: "correlation", x: 0, y: 142, w: 6, h: 14 },
    { i: "vprofile",    x: 0, y: 156, w: 6, h: 20 },
    { i: "volatility",  x: 0, y: 176, w: 6, h: 11 },
    { i: "mtfTrend",    x: 0, y: 187, w: 6, h: 11 },
    { i: "internals",   x: 0, y: 198, w: 6, h: 13 },
    { i: "overnight",   x: 0, y: 211, w: 6, h: 14 },
    { i: "session",     x: 0, y: 225, w: 6, h: 12 },
    { i: "options",     x: 0, y: 237, w: 6, h: 14 },
    { i: "heatmap",     x: 0, y: 251, w: 6, h: 22 },
    { i: "watchlist",   x: 0, y: 273, w: 6, h: 12 },
    { i: "calculator",  x: 0, y: 285, w: 6, h: 18 },
    { i: "journal",     x: 0, y: 303, w: 6, h: 18 },
    { i: "analytics",   x: 0, y: 321, w: 6, h: 24 },
    { i: "backtest",    x: 0, y: 345, w: 6, h: 24 },
    { i: "checklist",   x: 0, y: 369, w: 6, h: 12 },
  ],
  xs: [
    { i: "chart",       x: 0, y: 0,   w: 4, h: 22 },
    { i: "tradingview", x: 0, y: 22,  w: 4, h: 22 },
    { i: "aiSummary",   x: 0, y: 44,  w: 4, h: 26 },
    { i: "insights",    x: 0, y: 70,  w: 4, h: 16 },
    { i: "market",      x: 0, y: 86,  w: 4, h: 16 },
    { i: "alerts",      x: 0, y: 102, w: 4, h: 18 },
    { i: "calendar",    x: 0, y: 120, w: 4, h: 18 },
    { i: "news",        x: 0, y: 138, w: 4, h: 18 },
    { i: "correlation", x: 0, y: 156, w: 4, h: 15 },
    { i: "vprofile",    x: 0, y: 171, w: 4, h: 22 },
    { i: "volatility",  x: 0, y: 193, w: 4, h: 12 },
    { i: "mtfTrend",    x: 0, y: 205, w: 4, h: 11 },
    { i: "internals",   x: 0, y: 216, w: 4, h: 14 },
    { i: "overnight",   x: 0, y: 230, w: 4, h: 16 },
    { i: "session",     x: 0, y: 246, w: 4, h: 12 },
    { i: "options",     x: 0, y: 258, w: 4, h: 15 },
    { i: "heatmap",     x: 0, y: 273, w: 4, h: 24 },
    { i: "watchlist",   x: 0, y: 297, w: 4, h: 12 },
    { i: "calculator",  x: 0, y: 309, w: 4, h: 20 },
    { i: "journal",     x: 0, y: 329, w: 4, h: 20 },
    { i: "analytics",   x: 0, y: 349, w: 4, h: 26 },
    { i: "backtest",    x: 0, y: 375, w: 4, h: 26 },
    { i: "checklist",   x: 0, y: 401, w: 4, h: 12 },
  ],
  xxs: [
    { i: "chart",       x: 0, y: 0,   w: 2, h: 24 },
    { i: "tradingview", x: 0, y: 24,  w: 2, h: 24 },
    { i: "aiSummary",   x: 0, y: 48,  w: 2, h: 28 },
    { i: "insights",    x: 0, y: 76,  w: 2, h: 18 },
    { i: "market",      x: 0, y: 94,  w: 2, h: 18 },
    { i: "alerts",      x: 0, y: 112, w: 2, h: 20 },
    { i: "calendar",    x: 0, y: 132, w: 2, h: 20 },
    { i: "news",        x: 0, y: 152, w: 2, h: 20 },
    { i: "correlation", x: 0, y: 172, w: 2, h: 16 },
    { i: "vprofile",    x: 0, y: 188, w: 2, h: 24 },
    { i: "volatility",  x: 0, y: 212, w: 2, h: 13 },
    { i: "mtfTrend",    x: 0, y: 225, w: 2, h: 12 },
    { i: "internals",   x: 0, y: 237, w: 2, h: 15 },
    { i: "overnight",   x: 0, y: 252, w: 2, h: 18 },
    { i: "session",     x: 0, y: 270, w: 2, h: 13 },
    { i: "options",     x: 0, y: 283, w: 2, h: 16 },
    { i: "heatmap",     x: 0, y: 299, w: 2, h: 26 },
    { i: "watchlist",   x: 0, y: 325, w: 2, h: 13 },
    { i: "calculator",  x: 0, y: 338, w: 2, h: 20 },
    { i: "journal",     x: 0, y: 358, w: 2, h: 22 },
    { i: "analytics",   x: 0, y: 380, w: 2, h: 28 },
    { i: "backtest",    x: 0, y: 408, w: 2, h: 28 },
    { i: "checklist",   x: 0, y: 436, w: 2, h: 13 },
  ],
};

const LAYOUT_KEY = "nqdesk.layout.v10";

export function DashboardGrid() {
  const mode = useDbMode();
  const [layouts, setLayouts] = useState<Layouts>(DEFAULT_LAYOUTS);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (mode === "checking") return;
    if (mode === "db") {
      fetch("/api/settings/layout", { cache: "no-store" })
        .then((r) => (r.ok ? r.json() : { layout: null }))
        .then((d) => {
          if (d?.layout) setLayouts(d.layout as Layouts);
        })
        .catch(() => {
          try {
            const raw = localStorage.getItem(LAYOUT_KEY);
            if (raw) setLayouts(JSON.parse(raw));
          } catch {
            /* default layout */
          }
        });
    } else {
      try {
        const raw = localStorage.getItem(LAYOUT_KEY);
        if (raw) setLayouts(JSON.parse(raw));
      } catch {
        /* default layout */
      }
    }
  }, [mode]);

  function handleChange(_current: unknown, all: Layouts) {
    setLayouts(all);
    if (mode === "db") {
      void fetch("/api/settings/layout", {
        method: "PUT",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ layout: all }),
      });
    } else {
      try {
        localStorage.setItem(LAYOUT_KEY, JSON.stringify(all));
      } catch {
        /* best-effort */
      }
    }
  }

  if (!mounted) {
    return (
      <div className="h-[800px] grid place-items-center text-text-muted text-sm">
        Loading dashboard…
      </div>
    );
  }

  return (
    <ResponsiveGridLayout
      className="layout pt-4"
      layouts={layouts}
      breakpoints={BREAKPOINTS}
      cols={COLS}
      rowHeight={28}
      margin={[12, 12]}
      containerPadding={[0, 0]}
      onLayoutChange={handleChange}
      draggableHandle=".grid-drag-handle"
      compactType="vertical"
    >
      <div key="chart"><DragHandle /><ChartWidget /></div>
      <div key="tradingview"><DragHandle /><TradingViewWidget /></div>
      <div key="aiSummary"><DragHandle /><AiSummaryWidget /></div>
      <div key="insights"><DragHandle /><AiInsightsWidget /></div>
      <div key="market"><DragHandle /><MarketOverview /></div>
      <div key="alerts"><DragHandle /><AlertsWidget /></div>
      <div key="vprofile"><DragHandle /><VolumeProfileWidget /></div>
      <div key="correlation"><DragHandle /><CorrelationWidget /></div>
      <div key="volatility"><DragHandle /><VolatilityWidget /></div>
      <div key="mtfTrend"><DragHandle /><MultiTimeframeTrend /></div>
      <div key="internals"><DragHandle /><MarketInternals /></div>
      <div key="overnight"><DragHandle /><OvernightSession /></div>
      <div key="session"><DragHandle /><SessionStats /></div>
      <div key="options"><DragHandle /><OptionsWidget /></div>
      <div key="calendar"><DragHandle /><CalendarWidget /></div>
      <div key="news"><DragHandle /><NewsWidget /></div>
      <div key="watchlist"><DragHandle /><Watchlist /></div>
      <div key="heatmap"><DragHandle /><HeatmapWidget /></div>
      <div key="calculator"><DragHandle /><PositionCalculator /></div>
      <div key="journal"><DragHandle /><JournalWidget /></div>
      <div key="analytics"><DragHandle /><AnalyticsWidget /></div>
      <div key="backtest"><DragHandle /><BacktestWidget /></div>
      <div key="checklist"><DragHandle /><TradingChecklist /></div>
    </ResponsiveGridLayout>
  );
}

function DragHandle() {
  return (
    <div
      className="grid-drag-handle absolute top-2 right-3 z-10 cursor-grab active:cursor-grabbing rounded-md px-1.5 py-0.5 text-2xs uppercase tracking-[0.12em] text-text-muted hover:text-text-secondary hover:bg-white/5 select-none"
      title="Drag to reposition"
    >
      drag
    </div>
  );
}
