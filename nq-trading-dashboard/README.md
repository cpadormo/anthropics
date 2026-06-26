# NQ Desk — Trading Dashboard

Professional discretionary trading cockpit, optimized for Nasdaq-100 E-mini and Micro E-mini futures (NQ / MNQ).

> **Status: V2B-3** — V2B is complete. Real Tradovate historical candles now stream via `md/getChart`; session levels, RTH stats, ATR, and Volume Profile all derive from those real bars. Anything Tradovate can't reach (non-CME symbols, market internals) still falls through to the mock with a clear status indicator.

## Quick start

```bash
npm install
npm run dev
# open http://localhost:3000
```

No API keys required to run — the dashboard launches on the mock feed; top bar shows "Mock feed".

## Enabling Tradovate (real-time CME quotes and bars)

1. Copy `.env.example` to `.env.local` and fill in your Tradovate credentials.
2. Set `NEXT_PUBLIC_DATA_PROVIDER=tradovate`.
3. Restart `npm run dev`. The top bar pill flips "Tradovate · Connecting" → "Tradovate · Live".

```bash
NEXT_PUBLIC_DATA_PROVIDER=tradovate
TRADOVATE_ENV=demo                  # demo for paper, live for funded
TRADOVATE_USERNAME=your_username
TRADOVATE_PASSWORD=your_password
TRADOVATE_CID=12345                 # numeric app id from your Tradovate API console
TRADOVATE_SECRET=your_app_secret
TRADOVATE_APP_ID=NQDesk
TRADOVATE_DEVICE_ID=nqdesk-dev      # any stable string per workstation
```

**What flows from Tradovate now:**

| Surface | Source |
| --- | --- |
| NQ / ES / RTY / YM live quotes | `md/subscribequote` (WS) |
| NQ / ES / RTY / YM candles for every timeframe (1m / 5m / 15m / 1H / 4H / D) | `md/getChart` (WS) |
| Session levels (Asia / London / ON, PDH/PDL/PDC, PWH/PWL, PMH/PML, gap) | derived from real 1500 × 1m + 60 × D bars |
| RTH stats (H/L/range, IB, opening print, momentum, 20d avg range) | derived from real 1m + D bars |
| Volume Profile, Chart indicators (VWAP / EMA / Supertrend / RSI / MACD / ADX), Multi-Timeframe Trend | computed from real bars |
| Volatility (ATR, realized vol, expected move from VIX) | ATR / realized from real daily bars; VIX still mock-sourced |

**What still falls through to mock (and why):**

- VIX, VVIX, DXY, US10Y, GC, CL, BTC, ETH — not in CME / not on a Tradovate plan most discretionary NQ traders have. V3 will route a separate provider per asset class.
- Market Internals (NYSE/NASDAQ TICK, TRIN, A/D, ADD, Put/Call) — requires a premium feed (IQFeed or equivalent). Decision deferred to V3.

**Security model.** Username, password, CID, and SECRET are server-only. `/api/tradovate/auth` exchanges them for a scoped `mdAccessToken` that the browser uses to open the market-data WebSocket directly.

**Reconnect behavior.** WS exponential backoff (1s → 30s); on reconnect, quote subscriptions and active chart subscriptions are replayed with fresh request ids.

## How session derivation works

`lib/data/derive.ts` is pure and easy to unit test:

- **Asia**: bars whose ET open time is in `[prev-day 18:00, today 03:00)`
- **London**: bars in `[today 03:00, today 09:30)`
- **Overnight**: union of Asia + London
- **RTH**: `[today 09:30, today 16:00)`
- **Initial Balance**: `[today 09:30, today 10:30)`
- **Prev day / week / month**: last 1 / 5 / 21 settled daily bars
- ET resolution is via `Intl.DateTimeFormat` so DST handles itself.

Derivation runs every poll cycle from `useSessionLevels` / `useRthStats`; both functions are O(N) on the bar arrays, which is trivial at 1500 + 60 inputs.

## Complete widget set (V1 + V2A + V2B)

| Widget | Purpose |
| --- | --- |
| Chart | Recharts candlesticks + VWAP and EMA 20/50/100/200 + Supertrend + RSI/MACD/ADX sub-panel |
| Multi-Timeframe Trend | 4 symbols × 6 timeframes, bull/bear/neutral cells with 0–100 strength |
| Market Overview | 11 instruments — price, daily %, change, sparkline |
| Market Internals | TICK / TRIN / A-D / ADD / Put-Call / Risk Regime gauge (synthetic until V3) |
| Overnight & Key Levels | Asia/London/Overnight high & low, prior day/week/month levels, gap |
| Session Statistics | RTH high/low, range vs avg, IB high/low, breakout state, momentum |
| Volatility | VIX, VVIX, ATR(14, D), 20-day realized vol, today's range vs ATR%, 1D expected move |
| Volume Profile | 40-bin profile, POC, 70% value area (VAH / VAL) |
| Watchlist | Sortable, per-row notes, persists locally |
| Position Size Calculator | NQ/MNQ/ES/MES/RTY/M2K/YM/MYM, fixed-fractional risk model |
| Pre-Trade Checklist | 7-item discipline gate, persists locally |

## Architecture

```
app/
  api/tradovate/auth/   # server-side credential exchange
  layout.tsx, page.tsx, globals.css
components/
  layout/               # TopBar (with provider status pill) + drag/resize grid
  widgets/              # 11 widgets
  ui/                   # GlassCard, Sparkline, PriceCell, StatTile, TimeframePicker
lib/
  data/
    provider.ts             # DataProvider interface + ProviderStatus + optional onCandlesChange
    provider-factory.ts     # mock vs tradovate switch (NEXT_PUBLIC_DATA_PROVIDER)
    mock-feed.ts            # MockDataProvider
    tradovate-client.ts     # WS framing, quote + chart subscriptions, reconnect
    tradovate-provider.ts   # DataProvider over the client, with mock fallback
    derive.ts               # pure deriveSessionLevels / deriveRthStats
    symbols.ts              # CME quarterly front-month resolver
    internals.ts            # Synthetic Market Internals feed (until V3)
  hooks/                # useQuote, useQuotes, useCandles, useSessionLevels, useRthStats, useInternals, useProviderStatus
  indicators/           # SMA, EMA, VWAP, RSI, MACD, ATR, Supertrend, ADX, trendFromEMA
  instruments.ts        # Instrument specs (tick size, multiplier, vol, decimals)
  types.ts              # Quote, Candle, Timeframe, ProviderStatus types
  utils.ts
```

## Phase plan

- ✅ **V1** — Core shell + decision-critical widgets
- ✅ **V2A** — Chart + indicators + multi-timeframe trend
- ✅ **V2B-1** — Tradovate adapter scaffolding + Volatility + Volume Profile
- ✅ **V2B-2** — Market Internals + Supertrend + ADX + provider status
- ✅ **V2B-3** — Real Tradovate candles + derived session levels & RTH stats (this release)
- **V3** — Economic Calendar (CPI / PPI / NFP / FOMC / Powell / auctions / OpEx) + filtered news feed + Options (GEX / Max Pain / dealer positioning / largest strikes) + real internals feed decision (IQFeed vs CME)
- **V4** — AI Market Summary (1-min cadence), AI Insights (regime / sweep / squeeze / IB break / failed auction detection), Correlation Dashboard, Heatmaps
- **V5** — Supabase + Prisma persistence (watchlists, journal, alerts), broker / TradingView / Discord / SMS integrations, performance analytics, backtesting
