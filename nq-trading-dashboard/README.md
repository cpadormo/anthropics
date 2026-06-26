# NQ Desk — Trading Dashboard

Professional discretionary trading cockpit, optimized for Nasdaq-100 E-mini and Micro E-mini futures (NQ / MNQ).

> **Status: V2A** — charting + indicators + multi-timeframe trend on top of the V1 cockpit. Still running on a deterministic mock feed; real-data adapter and the remaining V2 widgets (Volume Profile, Market Internals, Volatility) land in V2B.

## Quick start

```bash
npm install
npm run dev
# open http://localhost:3000
```

No API keys required. The mock feed produces realistic, seeded ticks and OHLC bars for every instrument so the dashboard is fully exercised the moment it loads.

## What's in V2A

Everything in V1 plus:

| Widget | What it does |
| --- | --- |
| **Chart** | Recharts candlesticks with VWAP and EMA 20 / 50 / 100 / 200 overlays (each toggleable) plus RSI(14) or MACD(12,26,9) sub-panel. Symbol and timeframe pickers (1m / 5m / 15m / 1H / 4H / D) live in the header. |
| **Multi-Timeframe Trend** | 4 symbols (NQ / ES / RTY / YM) × 6 timeframes grid. Each cell is colored bull / bear / neutral from the EMA20-vs-EMA50 spread and shows a 0–100 strength score. One glance tells you whether the higher TFs agree with your entry. |

Indicator math lives in `lib/indicators/` (SMA, EMA, VWAP, RSI, MACD, ATR, trend-from-EMA) and is unit-test ready.

## V1 widgets (still shipped)

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
  widgets/          # Per-feature widgets (chart, mtf-trend, market-overview, …)
  ui/               # GlassCard, Sparkline, PriceCell, StatTile, TimeframePicker
lib/
  data/             # DataProvider interface + MockDataProvider
  hooks/            # useQuote / useQuotes / useSessionLevels / useRthStats / useCandles
  indicators/       # SMA, EMA, VWAP, RSI, MACD, ATR, trendFromEMA
  instruments.ts    # Instrument specs (tick size, multiplier, vol, decimals)
  types.ts          # Shared types (Quote, Candle, Timeframe, …)
  utils.ts          # cn, fmtPrice, fmtPct, fmtSigned
```

The **data layer is interface-first** (`lib/data/provider.ts`). V1 / V2A implement it with `MockDataProvider` (per-symbol seeded geometric Brownian motion; OHLC bars synthesized per (symbol, timeframe) with the right vol scaling). V2B will swap in a real adapter (Databento / Polygon / Tradovate / IBKR) behind the same contract without touching widgets, hooks, or indicators.

## Phase plan

- ✅ **V1** — Core shell + decision-critical widgets
- ✅ **V2A** — Chart + indicators + multi-timeframe trend (this release)
- **V2B** — Real data feed adapter, Volume Profile / Delta / POC / VAH / VAL, Market Internals (TICK / TRIN / A-D / ADD / Put-Call), Volatility (VIX / VVIX / ATR / expected move), Supertrend / ADX
- **V3** — Economic Calendar with countdowns (CPI / PPI / NFP / FOMC / Powell / auctions / OpEx), filtered news feed, Options (GEX / Max Pain / dealer positioning / largest strikes)
- **V4** — AI Market Summary (1-min cadence), AI Insights (trend/range/reversal/sweep/squeeze/IB break/failed auction detection), Correlation Dashboard, Heatmaps
- **V5** — Supabase + Prisma persistence (watchlists, journal, alerts), broker / TradingView / Discord / SMS integrations, performance analytics, backtesting

## Notes on stack choices

- `shadcn/ui` is **deferred to V3** — V1/V2A ship shadcn-styled primitives inline to keep the surface small. The registry slots in cleanly when later phases need richer components (command palette, modals, sheets).
- `Framer Motion` is **deferred to V3** for the same reason — current widgets use Tailwind transitions only.
- `Supabase` + `Prisma` arrive in **V5** when there's user state worth persisting server-side (journal, alerts, multi-device watchlists).
