# NQ Desk — Trading Dashboard

Professional discretionary trading cockpit, optimized for Nasdaq-100 E-mini and Micro E-mini futures (NQ / MNQ).

> **Status: V4** — 18 widgets, AI layer live. V4 adds an LLM-generated market summary, automatic pattern detection, a live correlation matrix, and a sector / Mag 7 / semis heatmap.

## Quick start

```bash
npm install
npm run dev
# open http://localhost:3000
```

No API keys required to run. Every external surface (Tradovate, Finnhub, Anthropic, options, internals, heatmap constituents) has a clean fallback with a clear "demo" pill so you can build the layout and learn the keys before wiring real data.

## Enable real data

Copy `.env.example` to `.env.local` and fill in only the keys you have — the dashboard upgrades surface-by-surface.

### Tradovate — live CME quotes + historical candles

```bash
NEXT_PUBLIC_DATA_PROVIDER=tradovate
TRADOVATE_ENV=demo                  # demo | live
TRADOVATE_USERNAME=your_username
TRADOVATE_PASSWORD=your_password
TRADOVATE_CID=12345
TRADOVATE_SECRET=your_app_secret
TRADOVATE_APP_ID=NQDesk
TRADOVATE_DEVICE_ID=nqdesk-dev
```

### Finnhub — Economic Calendar + News

```bash
FINNHUB_API_KEY=your_finnhub_key
```

### Anthropic — AI Market Summary (V4)

```bash
ANTHROPIC_API_KEY=your_anthropic_key
ANTHROPIC_MODEL=claude-sonnet-4-6   # claude-sonnet-4-6 | claude-haiku-4-5-20251001 | claude-opus-4-8
```

At the 1-minute polling cadence with ~2k input tokens per call, Sonnet 4.6 runs roughly $0.10–$0.30 per trading day. Switch to `claude-haiku-4-5-20251001` for ~10× cheaper at the cost of slightly less nuanced commentary, or `claude-opus-4-8` for premium analysis.

## V4 widgets

| Widget | What it does |
| --- | --- |
| **AI Market Summary** | Server-side `/api/ai/summary` posts a current-state snapshot to Claude every 60s and returns a strict JSON contract: bias (bull/bear/neutral), confidence %, reasoning, 3 supports, 3 resistances, 2–3 scenarios, top 2 risks, and patience level (wait / selective / engaged). Falls back to a structured demo summary when `ANTHROPIC_API_KEY` is unset. |
| **AI Insights** | Pure heuristic detection (no LLM cost, no latency): Trend Day, Range Day, Liquidity Sweep of PDH/PDL, Opening Drive, Failed Auction (up / down), Inside / Outside Day, Short Squeeze (VIX collapse + NQ rip), Long Liquidation, plus a daily-EMA Regime classifier. Each pattern carries a confidence score and bull/bear/warn/info tone. |
| **Correlation Dashboard** | 10×10 Pearson matrix on 5-minute log returns (last 60 bars) across NQ / ES / RTY / YM / VIX / DXY / US10Y / GC / CL / BTC. Color-graded cells. |
| **Heatmaps** | S&P sectors (11 SPDRs), Magnificent 7, and Semiconductors. Tiles colored by % change. Synthetic until V5 wires real constituent quotes (Polygon or IEX). |

## Complete widget set (18)

| Widget | Purpose |
| --- | --- |
| Chart | Recharts candlesticks + VWAP + EMA 20/50/100/200 + Supertrend + RSI/MACD/ADX sub-panel |
| **AI Market Summary** | LLM-generated bias, levels, scenarios, risks, patience |
| **AI Insights** | Heuristic pattern + regime detection |
| **Correlation Dashboard** | 10×10 cross-asset correlation matrix |
| **Heatmaps** | Sectors / Mag 7 / Semis |
| Multi-Timeframe Trend | 4 symbols × 6 timeframes, bull/bear/neutral cells |
| Market Overview | 11 instruments — price, daily %, change, sparkline |
| Market Internals | TICK / TRIN / A-D / ADD / Put-Call / Risk Regime gauge |
| Overnight & Key Levels | Asia/London/Overnight + PDH/PDL/PDC + PWH/PWL + PMH/PML + gap |
| Session Statistics | RTH high/low, range vs avg, IB high/low, breakout state, momentum |
| Volatility | VIX, VVIX, ATR(14, D), 20-day realized vol, range vs ATR%, 1D expected move |
| Volume Profile | 40-bin profile, POC, 70% value area (VAH / VAL) |
| Economic Calendar | High + medium impact events, sticky countdown to next print |
| News Feed | Filtered, categorized headlines |
| Options | GEX / Max Pain / dealer pos / expected move / largest OI strikes |
| Watchlist | Sortable, per-row notes, persists locally |
| Position Size Calculator | NQ/MNQ/ES/MES/RTY/M2K/YM/MYM, fixed-fractional risk |
| Pre-Trade Checklist | 7-item discipline gate, persists locally |

## Architecture

```
app/
  api/
    tradovate/auth/         # server-side Tradovate credential exchange
    finnhub/calendar/       # server-side proxy, revalidate=600
    finnhub/news/           # server-side proxy, revalidate=120
    ai/summary/             # server-side Claude proxy (POST, snapshot in body)
  layout.tsx, page.tsx, globals.css
components/
  layout/                   # TopBar (provider status pill) + drag/resize grid
  widgets/                  # 18 widgets
  ui/                       # GlassCard, Sparkline, PriceCell, StatTile, TimeframePicker, Countdown
lib/
  data/
    provider.ts             # DataProvider interface + ProviderStatus
    provider-factory.ts     # mock vs tradovate switch
    mock-feed.ts            # MockDataProvider
    tradovate-client.ts     # WS framing + quote + chart subs + reconnect
    tradovate-provider.ts   # DataProvider over the client, with mock fallback
    derive.ts               # pure deriveSessionLevels / deriveRthStats
    symbols.ts              # CME quarterly front-month resolver
    internals.ts            # Synthetic Market Internals feed (until V5)
    calendar.ts             # Calendar types + categorizer + demo data
    news.ts                 # News types + categorizer + noise filter + demo data
    options.ts              # Synthetic options summary (until V5)
    insights.ts             # Pure pattern + regime detection
    correlations.ts         # Pearson correlation matrix
    heatmap.ts              # Synthetic heatmap groups (until V5)
  hooks/                    # useQuote(s), useCandles, useSessionLevels, useRthStats, useInternals, useProviderStatus, useCalendar, useNews, useOptions, useAiSummary, useInsights, useCorrelations, useHeatmap
  indicators/               # SMA, EMA, VWAP, RSI, MACD, ATR, Supertrend, ADX, trendFromEMA
  instruments.ts            # Instrument specs
  types.ts                  # Shared types
  utils.ts
```

## Phase plan

- ✅ **V1** — Core shell + decision-critical widgets
- ✅ **V2A** — Chart + indicators + multi-timeframe trend
- ✅ **V2B-1** — Tradovate adapter scaffolding + Volatility + Volume Profile
- ✅ **V2B-2** — Market Internals + Supertrend + ADX + provider status
- ✅ **V2B-3** — Real Tradovate candles + derived session levels & RTH stats
- ✅ **V3** — Economic Calendar + News Feed + Options panel
- ✅ **V4** — AI Market Summary + AI Insights + Correlation Dashboard + Heatmaps (this release)
- **V5** — Supabase + Prisma persistence (watchlists, journal, alerts), broker / TradingView / Discord / SMS integrations, performance analytics, backtesting, real Market Internals (IQFeed) + real options feed + real heatmap constituents (Polygon / IEX)
