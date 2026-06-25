# NQ Desk — Trading Dashboard

Professional discretionary trading cockpit, optimized for Nasdaq-100 E-mini and Micro E-mini futures (NQ / MNQ).

> **Status: Version 1** — core shell, decision-critical widgets, deterministic mock feed. Real data, charting, AI, news, and persistence land in later phases (see [Phase Plan](#phase-plan)).

## Quick start

```bash
npm install
npm run dev
# open http://localhost:3000
```

No API keys required for V1. The mock feed produces realistic, seeded ticks for every instrument so the dashboard is fully exercised the moment it loads.

## What's in V1

**Shell**
- Dark, glassmorphism UI tuned for long screen time during a session
- Drag-and-drop, resizable widgets (react-grid-layout). Your layout persists locally.
- Sticky top bar with live session indicator (Asia / London / NY RTH / Pre-Post) and ET + UTC clocks

**Widgets**

| Widget | What it does |
| --- | --- |
| Market Overview | NQ, ES, RTY, YM, VIX, DXY, US10Y, GC, CL, BTC, ETH — price, daily %, change, trend, sparkline |
| Overnight & Key Levels | Asia/London/Overnight high & low, prior day / week / month levels, gap |
| Session Statistics | RTH high/low, range vs 20-day avg, range expansion %, IB high/low, breakout state, momentum |
| Watchlist | Sortable, per-row notes, persists locally |
| Position Size Calculator | NQ/MNQ/ES/MES/RTY/M2K/YM/MYM — contracts sized from fixed-fractional risk, target $, R:R |
| Pre-Trade Checklist | 7-item discipline gate, persists locally, explicit "cleared to execute" state |

## Architecture

```
app/                # Next.js App Router entry
components/
  layout/           # TopBar + drag/resize grid
  widgets/          # Per-feature widgets
  ui/               # GlassCard, Sparkline, PriceCell, StatTile
lib/
  data/             # DataProvider interface + MockDataProvider
  hooks/            # useQuote / useQuotes / useSessionLevels / useRthStats
  instruments.ts    # Instrument specs (tick size, multiplier, vol, decimals)
  types.ts          # Shared types
  utils.ts          # cn, fmtPrice, fmtPct, fmtSigned
```

The **data layer is interface-first** (`lib/data/provider.ts`). V1 implements it with `MockDataProvider` (per-symbol seeded geometric Brownian motion). V2 will swap in a Databento / Polygon / Tradovate adapter without touching widgets or hooks.

## Phase plan

- ✅ **V1** — Core shell + decision-critical widgets (this release)
- **V2** — Real data feed adapter, VWAP / EMAs / RSI / MACD / Supertrend / ADX, Volume Profile, Market Internals (TICK / TRIN / A-D), Volatility (VIX / VVIX / ATR), multi-timeframe trend
- **V3** — Economic Calendar with countdowns (CPI / PPI / NFP / FOMC / Powell / auctions / OpEx), filtered news feed, Options (GEX / Max Pain / dealer positioning / largest strikes)
- **V4** — AI Market Summary (1-min cadence), AI Insights (trend/range/reversal/sweep/squeeze/IB break/failed auction detection), Correlation Dashboard, Heatmaps
- **V5** — Supabase + Prisma persistence (watchlists, journal, alerts), broker / TradingView / Discord / SMS integrations, performance analytics, backtesting

## Notes on stack choices

- `shadcn/ui` is **deferred to V2** — V1 ships shadcn-styled primitives inline to keep the surface small. The registry slots in cleanly when later phases need richer components.
- `Recharts` is **deferred to V2** — V1 sparklines are hand-rolled SVG for tick-rate perf. Recharts arrives with proper candlestick / VWAP / volume profile charts.
- `Framer Motion` is **deferred to V2** for the same reason — V1 uses Tailwind transitions only.
- `Supabase` + `Prisma` arrive in **V5** when there's user state worth persisting server-side (journal, alerts, multi-device watchlists).
