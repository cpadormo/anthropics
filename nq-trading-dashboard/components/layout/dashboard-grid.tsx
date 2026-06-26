"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import type { Layouts } from "react-grid-layout";
import "react-grid-layout/css/styles.css";
import "react-resizable/css/styles.css";

import { ChartWidget } from "../widgets/chart";
import { MarketOverview } from "../widgets/market-overview";
import { MultiTimeframeTrend } from "../widgets/mtf-trend";
import { OvernightSession } from "../widgets/overnight-session";
import { PositionCalculator } from "../widgets/position-calculator";
import { SessionStats } from "../widgets/session-stats";
import { TradingChecklist } from "../widgets/trading-checklist";
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
    { i: "market",     x: 8, y: 0,  w: 4, h: 14, minW: 3, minH: 10 },
    { i: "mtfTrend",   x: 8, y: 14, w: 4, h: 6,  minW: 3, minH: 5 },
    { i: "overnight",  x: 0, y: 20, w: 4, h: 12, minW: 3, minH: 8 },
    { i: "session",    x: 4, y: 20, w: 4, h: 12, minW: 3, minH: 8 },
    { i: "watchlist",  x: 8, y: 20, w: 4, h: 12, minW: 3, minH: 6 },
    { i: "calculator", x: 0, y: 32, w: 6, h: 13, minW: 3, minH: 10 },
    { i: "checklist",  x: 6, y: 32, w: 6, h: 13, minW: 3, minH: 8 },
  ],
  md: [
    { i: "chart",      x: 0, y: 0,  w: 10, h: 20 },
    { i: "market",     x: 0, y: 20, w: 5,  h: 12 },
    { i: "mtfTrend",   x: 5, y: 20, w: 5,  h: 12 },
    { i: "overnight",  x: 0, y: 32, w: 5,  h: 12 },
    { i: "session",    x: 5, y: 32, w: 5,  h: 12 },
    { i: "watchlist",  x: 0, y: 44, w: 5,  h: 12 },
    { i: "calculator", x: 5, y: 44, w: 5,  h: 13 },
    { i: "checklist",  x: 0, y: 56, w: 10, h: 10 },
  ],
  sm: [
    { i: "chart",      x: 0, y: 0,  w: 6, h: 22 },
    { i: "market",     x: 0, y: 22, w: 6, h: 14 },
    { i: "mtfTrend",   x: 0, y: 36, w: 6, h: 11 },
    { i: "overnight",  x: 0, y: 47, w: 6, h: 14 },
    { i: "session",    x: 0, y: 61, w: 6, h: 11 },
    { i: "watchlist",  x: 0, y: 72, w: 6, h: 12 },
    { i: "calculator", x: 0, y: 84, w: 6, h: 13 },
    { i: "checklist",  x: 0, y: 97, w: 6, h: 12 },
  ],
  xs: [
    { i: "chart",      x: 0, y: 0,   w: 4, h: 22 },
    { i: "market",     x: 0, y: 22,  w: 4, h: 16 },
    { i: "mtfTrend",   x: 0, y: 38,  w: 4, h: 11 },
    { i: "overnight",  x: 0, y: 49,  w: 4, h: 16 },
    { i: "session",    x: 0, y: 65,  w: 4, h: 12 },
    { i: "watchlist",  x: 0, y: 77,  w: 4, h: 12 },
    { i: "calculator", x: 0, y: 89,  w: 4, h: 14 },
    { i: "checklist",  x: 0, y: 103, w: 4, h: 12 },
  ],
  xxs: [
    { i: "chart",      x: 0, y: 0,   w: 2, h: 24 },
    { i: "market",     x: 0, y: 24,  w: 2, h: 18 },
    { i: "mtfTrend",   x: 0, y: 42,  w: 2, h: 12 },
    { i: "overnight",  x: 0, y: 54,  w: 2, h: 18 },
    { i: "session",    x: 0, y: 72,  w: 2, h: 13 },
    { i: "watchlist",  x: 0, y: 85,  w: 2, h: 13 },
    { i: "calculator", x: 0, y: 98,  w: 2, h: 15 },
    { i: "checklist",  x: 0, y: 113, w: 2, h: 13 },
  ],
};

const LAYOUT_KEY = "nqdesk.layout.v2";

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
      <div key="mtfTrend"><DragHandle /><MultiTimeframeTrend /></div>
      <div key="overnight"><DragHandle /><OvernightSession /></div>
      <div key="session"><DragHandle /><SessionStats /></div>
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
