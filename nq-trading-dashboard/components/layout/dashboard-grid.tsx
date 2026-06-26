"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import type { Layouts } from "react-grid-layout";
import "react-grid-layout/css/styles.css";
import "react-resizable/css/styles.css";

import { CalendarWidget } from "../widgets/calendar";
import { ChartWidget } from "../widgets/chart";
import { MarketInternals } from "../widgets/market-internals";
import { MarketOverview } from "../widgets/market-overview";
import { MultiTimeframeTrend } from "../widgets/mtf-trend";
import { NewsWidget } from "../widgets/news";
import { OptionsWidget } from "../widgets/options";
import { OvernightSession } from "../widgets/overnight-session";
import { PositionCalculator } from "../widgets/position-calculator";
import { SessionStats } from "../widgets/session-stats";
import { TradingChecklist } from "../widgets/trading-checklist";
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
    { i: "chart",      x: 0, y: 0,  w: 8, h: 20, minW: 6, minH: 16 },
    { i: "market",     x: 8, y: 0,  w: 4, h: 12, minW: 3, minH: 10 },
    { i: "vprofile",   x: 8, y: 12, w: 4, h: 18, minW: 3, minH: 14 },
    { i: "volatility", x: 0, y: 20, w: 4, h: 10, minW: 3, minH: 8 },
    { i: "mtfTrend",   x: 4, y: 20, w: 4, h: 10, minW: 3, minH: 7 },
    { i: "internals",  x: 0, y: 30, w: 4, h: 13, minW: 3, minH: 10 },
    { i: "overnight",  x: 4, y: 30, w: 4, h: 13, minW: 3, minH: 8 },
    { i: "session",    x: 8, y: 30, w: 4, h: 13, minW: 3, minH: 8 },
    { i: "calendar",   x: 0, y: 43, w: 8, h: 14, minW: 4, minH: 8 },
    { i: "news",       x: 8, y: 43, w: 4, h: 14, minW: 3, minH: 8 },
    { i: "options",    x: 0, y: 57, w: 4, h: 14, minW: 3, minH: 10 },
    { i: "watchlist",  x: 4, y: 57, w: 4, h: 14, minW: 3, minH: 6 },
    { i: "calculator", x: 8, y: 57, w: 4, h: 14, minW: 3, minH: 10 },
    { i: "checklist",  x: 0, y: 71, w: 12, h: 11, minW: 3, minH: 8 },
  ],
  md: [
    { i: "chart",      x: 0, y: 0,   w: 10, h: 20 },
    { i: "market",     x: 0, y: 20,  w: 5,  h: 12 },
    { i: "mtfTrend",   x: 5, y: 20,  w: 5,  h: 12 },
    { i: "volatility", x: 0, y: 32,  w: 5,  h: 10 },
    { i: "internals",  x: 5, y: 32,  w: 5,  h: 13 },
    { i: "vprofile",   x: 0, y: 42,  w: 5,  h: 18 },
    { i: "overnight",  x: 5, y: 45,  w: 5,  h: 12 },
    { i: "calendar",   x: 0, y: 60,  w: 10, h: 14 },
    { i: "news",       x: 0, y: 74,  w: 5,  h: 14 },
    { i: "options",    x: 5, y: 74,  w: 5,  h: 14 },
    { i: "session",    x: 0, y: 88,  w: 5,  h: 12 },
    { i: "watchlist",  x: 5, y: 88,  w: 5,  h: 12 },
    { i: "calculator", x: 0, y: 100, w: 5,  h: 13 },
    { i: "checklist",  x: 5, y: 100, w: 5,  h: 13 },
  ],
  sm: [
    { i: "chart",      x: 0, y: 0,   w: 6, h: 22 },
    { i: "market",     x: 0, y: 22,  w: 6, h: 14 },
    { i: "calendar",   x: 0, y: 36,  w: 6, h: 16 },
    { i: "news",       x: 0, y: 52,  w: 6, h: 16 },
    { i: "internals",  x: 0, y: 68,  w: 6, h: 13 },
    { i: "vprofile",   x: 0, y: 81,  w: 6, h: 20 },
    { i: "volatility", x: 0, y: 101, w: 6, h: 11 },
    { i: "mtfTrend",   x: 0, y: 112, w: 6, h: 11 },
    { i: "options",    x: 0, y: 123, w: 6, h: 14 },
    { i: "overnight",  x: 0, y: 137, w: 6, h: 14 },
    { i: "session",    x: 0, y: 151, w: 6, h: 12 },
    { i: "watchlist",  x: 0, y: 163, w: 6, h: 12 },
    { i: "calculator", x: 0, y: 175, w: 6, h: 13 },
    { i: "checklist",  x: 0, y: 188, w: 6, h: 12 },
  ],
  xs: [
    { i: "chart",      x: 0, y: 0,   w: 4, h: 22 },
    { i: "market",     x: 0, y: 22,  w: 4, h: 16 },
    { i: "calendar",   x: 0, y: 38,  w: 4, h: 18 },
    { i: "news",       x: 0, y: 56,  w: 4, h: 18 },
    { i: "internals",  x: 0, y: 74,  w: 4, h: 14 },
    { i: "vprofile",   x: 0, y: 88,  w: 4, h: 22 },
    { i: "volatility", x: 0, y: 110, w: 4, h: 12 },
    { i: "mtfTrend",   x: 0, y: 122, w: 4, h: 11 },
    { i: "options",    x: 0, y: 133, w: 4, h: 15 },
    { i: "overnight",  x: 0, y: 148, w: 4, h: 16 },
    { i: "session",    x: 0, y: 164, w: 4, h: 12 },
    { i: "watchlist",  x: 0, y: 176, w: 4, h: 12 },
    { i: "calculator", x: 0, y: 188, w: 4, h: 14 },
    { i: "checklist",  x: 0, y: 202, w: 4, h: 12 },
  ],
  xxs: [
    { i: "chart",      x: 0, y: 0,   w: 2, h: 24 },
    { i: "market",     x: 0, y: 24,  w: 2, h: 18 },
    { i: "calendar",   x: 0, y: 42,  w: 2, h: 20 },
    { i: "news",       x: 0, y: 62,  w: 2, h: 20 },
    { i: "internals",  x: 0, y: 82,  w: 2, h: 15 },
    { i: "vprofile",   x: 0, y: 97,  w: 2, h: 24 },
    { i: "volatility", x: 0, y: 121, w: 2, h: 13 },
    { i: "mtfTrend",   x: 0, y: 134, w: 2, h: 12 },
    { i: "options",    x: 0, y: 146, w: 2, h: 16 },
    { i: "overnight",  x: 0, y: 162, w: 2, h: 18 },
    { i: "session",    x: 0, y: 180, w: 2, h: 13 },
    { i: "watchlist",  x: 0, y: 193, w: 2, h: 13 },
    { i: "calculator", x: 0, y: 206, w: 2, h: 15 },
    { i: "checklist",  x: 0, y: 221, w: 2, h: 13 },
  ],
};

const LAYOUT_KEY = "nqdesk.layout.v5";

export function DashboardGrid() {
  const [layouts, setLayouts] = useState<Layouts>(DEFAULT_LAYOUTS);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    try {
      const raw = localStorage.getItem(LAYOUT_KEY);
      if (raw) setLayouts(JSON.parse(raw));
    } catch {
      /* fall back to defaults */
    }
  }, []);

  function handleChange(_current: unknown, all: Layouts) {
    setLayouts(all);
    try {
      localStorage.setItem(LAYOUT_KEY, JSON.stringify(all));
    } catch {
      /* best-effort */
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
      <div key="market"><DragHandle /><MarketOverview /></div>
      <div key="vprofile"><DragHandle /><VolumeProfileWidget /></div>
      <div key="volatility"><DragHandle /><VolatilityWidget /></div>
      <div key="mtfTrend"><DragHandle /><MultiTimeframeTrend /></div>
      <div key="internals"><DragHandle /><MarketInternals /></div>
      <div key="overnight"><DragHandle /><OvernightSession /></div>
      <div key="session"><DragHandle /><SessionStats /></div>
      <div key="calendar"><DragHandle /><CalendarWidget /></div>
      <div key="news"><DragHandle /><NewsWidget /></div>
      <div key="options"><DragHandle /><OptionsWidget /></div>
      <div key="watchlist"><DragHandle /><Watchlist /></div>
      <div key="calculator"><DragHandle /><PositionCalculator /></div>
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
