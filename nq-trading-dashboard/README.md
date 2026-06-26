# NQ Desk — Trading Dashboard

Professional discretionary trading cockpit, optimized for Nasdaq-100 E-mini and Micro E-mini futures (NQ / MNQ).

> **Status: V2B-2** — V2 widget set is now complete. Tradovate is wired for live CME quotes; Market Internals, Supertrend, ADX, and a provider status indicator round out the technical and breadth view. V2B-3 brings real Tradovate historical candles (md/getChart) so session levels, RTH stats, ATR, and Volume Profile feed off real bars instead of mock.

## Quick start

```bash
npm install
npm run dev
# open http://localhost:3000
```

No API keys required to run — the dashboard launches on the mock feed and the top bar shows "Mock feed".

## Enabling Tradovate (real-time CME quotes)

1. Copy `.env.example` to `.env.local` and fill in your Tradovate credentials.
2. Set `NEXT_PUBLIC_DATA_PROVIDER=tradovate`.
3. Restart `npm run dev`. The top bar pill flips to "Tradovate · Connecting" → "Tradovate · Live".

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

**Security model.** Username, password, CID, and SECRET are server-only. The `/api/tradovate/auth` route exchanges them for a scoped `mdAccessToken` that the browser uses to open the market-data WebSocket directly. The full `accessToken` (which authorizes order entry) stays on the server.

**Coverage.** Tradovate streams CME futures (NQ / ES / RTY / YM). Non-CME instruments (VIX, DXY, US10Y, GC, CL, BTC, ETH), historical candles, session levels, and RTH stats fall through to the mock until V2B-3 wires real sources for each.

**Failure mode.** If credentials are missing or auth fails, the adapter logs the error, the top bar shows "Tradovate · Error" with the message in the tooltip, and the dashboard runs entirely on the mock feed.

## V2B-2 additions

| Where | What |
| --- | --- |
| **Chart · Supertrend overlay** | Classic ATR-banded trailing stop, period 10, multiplier 3. Renders as two color-segmented step lines (bull green / bear red) split at every direction flip so regime changes are unambiguous. |
| **Chart · ADX sub-panel** | Wilder ADX(14) with +DI and -DI, reference lines at 20 (trend threshold) and 40 (strong trend). Joins RSI and MACD in the sub-panel switcher. |
| **Market Internals widget** | NYSE TICK, NASDAQ TICK, TRIN, A/D, ADD line, Put/Call, plus a composite Risk Regime gauge. Mean-reverting OU dynamics until a real internals feed lands; clearly labeled "synthetic". |
| **Top bar · provider status pill** | "Mock feed" (gray), "Tradovate · Connecting" (amber, pulsing), "Tradovate · Live" (green, pulsing), "Tradovate · Error" (red, tooltip carries the error). |

## Complete widget set (V1 + V2A + V2B)

| Widget | Purpose |
| --- | --- |
| Chart | Recharts candlesticks + VWAP and EMA 20/50/100/200 + Supertrend + RSI/MACD/ADX sub-panel |
| Multi-Timeframe Trend | 4 symbols × 6 timeframes, bull/bear/neutral cells with 0–100 strength |
| Market Overview | 11 instruments — price, daily %, change, sparkline |
| Market Internals | TICK / TRIN / A-D / ADD / Put-Call / Risk Regime gauge |
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
    provider.ts             # DataProvider interface + ProviderStatus
    provider-factory.ts     # mock vs tradovate switch
    mock-feed.ts            # MockDataProvider
    tradovate-client.ts     # low-level WS client
    tradovate-provider.ts   # DataProvider wrapping the client
    symbols.ts              # CME quarterly front-month resolver
    internals.ts            # Synthetic Market Internals feed
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
- ✅ **V2B-2** — Market Internals + Supertrend + ADX + provider status (this release)
- **V2B-3** — Tradovate `md/getChart` (real historical candles) + derive session levels / RTH stats / ATR / Volume Profile from real bars; real internals feed decision (IQFeed vs CME data)
- **V3** — Economic Calendar (CPI / PPI / NFP / FOMC / Powell / auctions / OpEx) + filtered news feed + Options (GEX / Max Pain / dealer positioning / largest strikes)
- **V4** — AI Market Summary (1-min cadence), AI Insights (regime / sweep / squeeze / IB break / failed auction detection), Correlation Dashboard, Heatmaps
- **V5** — Supabase + Prisma persistence (watchlists, journal, alerts), broker / TradingView / Discord / SMS integrations, performance analytics, backtesting
