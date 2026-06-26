# NQ Desk — Trading Dashboard

Professional discretionary trading cockpit, optimized for Nasdaq-100 E-mini and Micro E-mini futures (NQ / MNQ).

> **Status: V3** — 14 widgets live. V2 covers the technical / market-structure surface from real Tradovate data; V3 adds the macro context layer: Economic Calendar with countdowns, a filtered News feed, and an Options panel.

## Quick start

```bash
npm install
npm run dev
# open http://localhost:3000
```

No API keys required to run. The dashboard launches on the mock feed, Calendar / News show curated demo data, Options is synthetic. Every demo surface has a clear "demo" pill.

## Enable real data

Copy `.env.example` to `.env.local`. Provide the keys you have; the dashboard upgrades surface-by-surface as each is configured.

### Tradovate — real-time CME quotes + historical candles

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

Top bar pill flips "Tradovate · Connecting" → "Tradovate · Live" once authorized.

### Finnhub — Economic Calendar + News (V3)

```bash
FINNHUB_API_KEY=your_finnhub_key
```

Free tier (60 req/min) is plenty: calendar polls every 5 min, news every 2 min, both via server-side proxies (`/api/finnhub/calendar`, `/api/finnhub/news`) that cache with `revalidate`. Key never reaches the browser.

## V3 widgets

| Widget | What it does |
| --- | --- |
| **Economic Calendar** | US high + medium impact events for next 3 days. Sticky countdown banner for the next high-impact print (CPI / NFP / FOMC / Powell). Per-event impact badge + category chip; actuals colored bull/bear vs estimate. |
| **News Feed** | Polled Finnhub general news, filtered for market relevance. Politics / lifestyle noise stripped unless it intersects markets. Per-headline relevance chip: Fed / Inflation / Treasury / Semis / Tech / Geopol / Breaking. |
| **Options** | GEX (signed), dealer positioning (Long / Short / Neutral gamma), Max Pain, P/C OI ratio, expected move 1D and 1W (computed from the real VIX quote), top 3 call / put OI strikes anchored to spot. Card flagged "demo" until a real options feed is wired in V4. |

## Complete widget set (14)

| Widget | Purpose |
| --- | --- |
| Chart | Recharts candlesticks + VWAP and EMA 20/50/100/200 + Supertrend + RSI/MACD/ADX sub-panel |
| Multi-Timeframe Trend | 4 symbols × 6 timeframes, bull/bear/neutral cells with 0–100 strength |
| Market Overview | 11 instruments — price, daily %, change, sparkline |
| Market Internals | TICK / TRIN / A-D / ADD / Put-Call / Risk Regime gauge (synthetic until V4) |
| Overnight & Key Levels | Asia/London/Overnight high & low, prior day/week/month, gap |
| Session Statistics | RTH high/low, range vs avg, IB high/low, breakout state, momentum |
| Volatility | VIX, VVIX, ATR(14, D), 20-day realized vol, today's range vs ATR%, 1D expected move |
| Volume Profile | 40-bin profile, POC, 70% value area (VAH / VAL) |
| **Economic Calendar** | Today's prints, countdown to next high-impact |
| **News Feed** | Filtered, categorized headlines |
| **Options** | GEX / Max Pain / dealer pos / expected move / largest OI strikes |
| Watchlist | Sortable, per-row notes, persists locally |
| Position Size Calculator | NQ/MNQ/ES/MES/RTY/M2K/YM/MYM, fixed-fractional risk |
| Pre-Trade Checklist | 7-item discipline gate, persists locally |

## Architecture

```
app/
  api/
    tradovate/auth/     # server-side Tradovate credential exchange
    finnhub/calendar/   # server-side proxy, revalidate=600
    finnhub/news/       # server-side proxy, revalidate=120
  layout.tsx, page.tsx, globals.css
components/
  layout/               # TopBar (provider status pill) + drag/resize grid
  widgets/              # 14 widgets
  ui/                   # GlassCard, Sparkline, PriceCell, StatTile, TimeframePicker, Countdown
lib/
  data/
    provider.ts             # DataProvider interface + ProviderStatus
    provider-factory.ts     # mock vs tradovate switch
    mock-feed.ts            # MockDataProvider
    tradovate-client.ts     # WS framing, quotes + chart subs, reconnect
    tradovate-provider.ts   # DataProvider over the client, with mock fallback
    derive.ts               # pure deriveSessionLevels / deriveRthStats
    symbols.ts              # CME quarterly front-month resolver
    internals.ts            # Synthetic Market Internals feed (until V4)
    calendar.ts             # Calendar types + categorizer + demo data
    news.ts                 # News types + categorizer + noise filter + demo data
    options.ts              # Synthetic options summary (until V4)
  hooks/                # useQuote(s), useCandles, useSessionLevels, useRthStats, useInternals, useProviderStatus, useCalendar, useNews, useOptions
  indicators/           # SMA, EMA, VWAP, RSI, MACD, ATR, Supertrend, ADX, trendFromEMA
  instruments.ts        # Instrument specs
  types.ts              # Shared types
  utils.ts
```

## Phase plan

- ✅ **V1** — Core shell + decision-critical widgets
- ✅ **V2A** — Chart + indicators + multi-timeframe trend
- ✅ **V2B-1** — Tradovate adapter scaffolding + Volatility + Volume Profile
- ✅ **V2B-2** — Market Internals + Supertrend + ADX + provider status
- ✅ **V2B-3** — Real Tradovate candles + derived session levels & RTH stats
- ✅ **V3** — Economic Calendar + News Feed + Options panel (this release)
- **V4** — AI Market Summary (1-min cadence), AI Insights (regime / sweep / squeeze / IB break / failed auction detection), Correlation Dashboard, S&P/NDX heatmaps, real Market Internals (IQFeed) + real options feed decision
- **V5** — Supabase + Prisma persistence (watchlists, journal, alerts), broker / TradingView / Discord / SMS integrations, performance analytics, backtesting
