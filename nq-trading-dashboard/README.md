# NQ Desk — Trading Dashboard

Professional discretionary trading cockpit, optimized for Nasdaq-100 E-mini and Micro E-mini futures (NQ / MNQ).

> **Status: V2B-1** — Tradovate adapter scaffolded behind the existing `DataProvider` interface, plus Volatility and Volume Profile widgets. CME futures (NQ/ES/RTY/YM) can stream live from Tradovate once credentials are configured; non-CME instruments, historical candles, and session-derived stats still come from the deterministic mock until V2B-2.

## Quick start

```bash
npm install
npm run dev
# open http://localhost:3000
```

No API keys required to run — the dashboard launches on the mock feed.

## Enabling Tradovate (real-time CME quotes)

1. Copy `.env.example` to `.env.local` and fill in your Tradovate credentials.
2. Set `NEXT_PUBLIC_DATA_PROVIDER=tradovate`.
3. Restart `npm run dev`.

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

**Security model.** Username, password, CID, and SECRET are server-only (no `NEXT_PUBLIC_` prefix). The `/api/tradovate/auth` route exchanges them for a scoped `mdAccessToken` that the browser uses to open the market-data WebSocket directly. The full `accessToken` (which authorizes order entry) stays on the server until later phases introduce trading flows.

**Front-month resolution.** `lib/data/symbols.ts` picks the active quarterly contract (H/M/U/Z) with a pragmatic 8-day-of-contract-month roll. Override per-root if you need a specific contract.

**Failure mode.** If credentials are missing or auth fails, the adapter logs the error to the console and the dashboard runs entirely on the mock feed.

## What's in V2B-1

Everything in V1 + V2A plus:

| Widget | What it does |
| --- | --- |
| **Volatility** | VIX, VVIX (placeholder until a real feed), ATR(14) on daily bars, 20-day annualized realized vol, today's range vs ATR%, and the 1-day expected move computed from VIX. |
| **Volume Profile** | 40-bin profile from 80 × 5-minute candles. Each bar's volume is distributed across its H/L range, then POC is identified and the 70% value area is expanded outward from POC (VAH / VAL). |

Adapter layer:

```
lib/data/
  provider.ts            # DataProvider interface (unchanged contract)
  provider-factory.ts    # picks mock vs tradovate from NEXT_PUBLIC_DATA_PROVIDER
  mock-feed.ts           # MockDataProvider (V1 default)
  tradovate-client.ts    # low-level WS client (framing, heartbeat, reconnect)
  tradovate-provider.ts  # DataProvider wrapping the client, with mock fallback
  symbols.ts             # CME quarterly front-month resolver
app/api/tradovate/
  auth/route.ts          # server-side credential exchange
```

## V1 + V2A widgets (still shipped)

| Widget | What it does |
| --- | --- |
| Chart | Recharts candlesticks + VWAP and EMA 20/50/100/200 overlays + RSI(14)/MACD(12,26,9) sub-panel |
| Multi-Timeframe Trend | 4 symbols × 6 timeframes grid, bull/bear/neutral cells with 0–100 strength |
| Market Overview | 11 instruments — price, daily %, change, trend, sparkline |
| Overnight & Key Levels | Asia/London/Overnight high & low, prior day/week/month levels, gap |
| Session Statistics | RTH high/low, range vs 20-day avg, range expansion %, IB high/low, breakout state, momentum |
| Watchlist | Sortable, per-row notes, persists locally |
| Position Size Calculator | NQ/MNQ/ES/MES/RTY/M2K/YM/MYM — contracts sized from fixed-fractional risk, target $, R:R |
| Pre-Trade Checklist | 7-item discipline gate, persists locally |

## Phase plan

- ✅ **V1** — Core shell + decision-critical widgets
- ✅ **V2A** — Chart + indicators + multi-timeframe trend
- ✅ **V2B-1** — Tradovate adapter scaffolding + Volatility + Volume Profile (this release)
- **V2B-2** — Tradovate `md/getChart` for real historical candles, derive session levels / RTH stats from real bars, Market Internals (TICK / TRIN / A-D / ADD / Put-Call) with a feed source decision, Supertrend + ADX added to chart
- **V3** — Economic Calendar with countdowns (CPI / PPI / NFP / FOMC / Powell / auctions / OpEx), filtered news feed, Options (GEX / Max Pain / dealer positioning / largest strikes)
- **V4** — AI Market Summary (1-min cadence), AI Insights (trend/range/reversal/sweep/squeeze/IB break/failed auction detection), Correlation Dashboard, Heatmaps
- **V5** — Supabase + Prisma persistence (watchlists, journal, alerts), broker / TradingView / Discord / SMS integrations, performance analytics, backtesting
