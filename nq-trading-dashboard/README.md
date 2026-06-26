# NQ Desk — Trading Dashboard

Professional discretionary trading cockpit, optimized for Nasdaq-100 E-mini and Micro E-mini futures (NQ / MNQ).

> **Status: V5-1** — 20 widgets live. V5-1 adds the Trading Journal and Performance Analytics on top of V4's intelligence layer. Storage is localStorage today; the Prisma schema is included as scaffolding for V5-2's Supabase sync.

## Quick start

```bash
npm install
npm run dev
# open http://localhost:3000
```

No API keys required. Every external surface (Tradovate, Finnhub, Anthropic, options, internals, heatmap constituents, journal sync) has a clean fallback with a clear "demo" or "local" pill so you can build the layout and learn the keys before wiring real data.

## Enable real data

Copy `.env.example` to `.env.local`. Provide only the keys you have — the dashboard upgrades surface-by-surface.

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

### Anthropic — AI Market Summary

```bash
ANTHROPIC_API_KEY=your_anthropic_key
ANTHROPIC_MODEL=claude-sonnet-4-6
```

## V5-1 additions

| Widget | What it does |
| --- | --- |
| **Trading Journal** | Inline log + edit form for symbol / side / contracts / entry / stop / exit / setup / tags / notes. R-multiple computed from `(exit - entry) / |entry - stop|`, dollar PnL from the correct point value per instrument (NQ=$20/pt, MNQ=$2/pt, ES=$50/pt, etc). Sortable table of recent trades, inline edit, delete on hover. Persists to localStorage. |
| **Performance Analytics** | 9 stat tiles — win rate, profit factor, expectancy R, avg win/loss R, max DD (R + $), total R, net $, trade count (W/L). Equity curve in R (Recharts line) with zero reference. R-multiple distribution histogram with bars colored bull/bear by bucket sign. All computed live from the journal. |

## Prisma schema (V5-2 preview)

`prisma/schema.prisma` is included now as a future-ready artifact. It models `Trade`, `Watchlist`, `Alert`, and `UserSetting` on Postgres. V5-2 will wire server routes that read/write through it against Supabase; storage swap will be transparent to the widgets.

When you're ready to enable:

```bash
npm install prisma @prisma/client
DATABASE_URL=postgresql://...        # Supabase connection string
npx prisma migrate dev --name init
```

## Complete widget set (20)

| Widget | Purpose |
| --- | --- |
| Chart | Recharts candlesticks + VWAP + EMA 20/50/100/200 + Supertrend + RSI/MACD/ADX sub-panel |
| AI Market Summary | Claude-generated bias / levels / scenarios / risks / patience (1m cadence) |
| AI Insights | Heuristic pattern + regime detection (no LLM cost) |
| Correlation Dashboard | 10×10 cross-asset correlation matrix |
| Heatmaps | Sectors / Mag 7 / Semis |
| Multi-Timeframe Trend | 4 symbols × 6 timeframes |
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
| **Trading Journal** | Log + edit trades, R-multiple + dollar PnL, persists locally |
| **Performance Analytics** | Win rate, profit factor, expectancy, equity curve, R distribution |
| Position Size Calculator | NQ/MNQ/ES/MES/RTY/M2K/YM/MYM, fixed-fractional risk |
| Pre-Trade Checklist | 7-item discipline gate, persists locally |

## Phase plan

- ✅ **V1 / V2A / V2B-1 / V2B-2 / V2B-3** — Shell, charting, indicators, Tradovate adapter, derived levels
- ✅ **V3** — Economic Calendar + News + Options
- ✅ **V4** — AI Summary + AI Insights + Correlation + Heatmaps
- ✅ **V5-1** — Trading Journal + Performance Analytics (this release)
- **V5-2** — Supabase + Prisma sync: server-side journal CRUD, multi-device watchlist sync, layout persistence under DATABASE_URL.
- **V5-3** — Alerts (price / level / indicator / event triggers) with browser notifications + Discord / Twilio (SMS) channels.
- **V5-4** — Tradovate order entry from the Position Calculator (the auth route already holds the full accessToken) + TradingView chart embed / webhook receiver.
- **V5-5** — Rule-based backtester over historical Tradovate bars (EMA crosses, IB breakouts, opening-drive setups) to validate edge before deploying.
- **V5-6** — Retire remaining synthetic surfaces: real Market Internals (IQFeed), real options feed (SpotGamma / Unusual Whales), real heatmap constituents (Polygon / IEX).
