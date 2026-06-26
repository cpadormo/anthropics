# NQ Desk — Trading Dashboard

Professional discretionary trading cockpit, optimized for Nasdaq-100 E-mini and Micro E-mini futures (NQ / MNQ).

> **Status: V1.0** — 23 widgets, full V5 plan complete. Every external surface has a real-data adapter; demo pills flip to "live" automatically when the corresponding key is configured.

## Quick start

```bash
npm install
npm run dev
# open http://localhost:3000
```

No API keys required. The dashboard ships with sensible synthetic data for every external surface so you can build the layout and learn the keys before wiring real providers.

## Enable real data, surface by surface

| Surface | Env to set | Notes |
| --- | --- | --- |
| Live CME quotes + historical candles + order entry | `NEXT_PUBLIC_DATA_PROVIDER=tradovate` + `TRADOVATE_USERNAME / PASSWORD / CID / SECRET` | Demo or live env per `TRADOVATE_ENV` |
| Economic Calendar + News Feed | `FINNHUB_API_KEY` | Free tier (60 req/min) is plenty |
| AI Market Summary | `ANTHROPIC_API_KEY` (default model `claude-sonnet-4-6`, override via `ANTHROPIC_MODEL`) | ~$0.10–$0.30 / trading day at default |
| Journal + layout sync | `DATABASE_URL` (Supabase / any Postgres) | Then `npm run db:generate && npm run db:push` |
| Alert channels | `DISCORD_WEBHOOK_URL` and / or `TWILIO_ACCOUNT_SID / AUTH_TOKEN / FROM_NUMBER / TO_NUMBER` | Browser notifications always available |
| TradingView alert webhook | `TRADINGVIEW_WEBHOOK_SECRET` | Validated on POST to `/api/tradingview/webhook?secret=...` |
| **Heatmap constituents (V5-6)** | `POLYGON_API_KEY` | Free tier (15-min delayed) works for snapshots |
| **Options GEX / Max Pain / OI (V5-6)** | `UNUSUAL_WHALES_API_KEY` | Endpoints depend on UW tier; adapter is defensive and falls back per-field |
| **Market Internals (V5-6)** | `IQFEED_BRIDGE_URL` | See [IQFeed bridge contract](#iqfeed-bridge-contract) below |

### IQFeed bridge contract

The Next.js app doesn't talk to IQConnect.exe directly — IQFeed is a Windows-native TCP service and conflating native concerns with the dashboard runtime is messy. Instead, you run a tiny HTTP bridge alongside IQConnect that exposes exactly one endpoint:

```
GET /internals
-> {
  "nyseTick":      number,   // NYSE cumulative TICK ($TICK in ToS)
  "nasdaqTick":    number,   // NASDAQ cumulative TICK ($TICKQ)
  "trin":          number,   // Arms index ($TRIN)
  "advanceDecline": number,  // advancers minus decliners
  "addLine":       number,   // cumulative A/D line
  "putCall":       number,   // put/call ratio
  "riskOn":        number,   // optional composite, [-1, 1]
  "ts":            number    // epoch ms
}
```

Then set `IQFEED_BRIDGE_URL=http://localhost:7878` (or wherever your bridge listens). A minimal Node bridge is around 50 lines using `net.createConnection({ port: 5009 })` to talk to IQConnect, parsing `T`/`Z` messages by tag, and serving the latest values on an HTTP endpoint. Same pattern works in Python with `socket` + `http.server`.

Keeping the bridge out of the Next.js app means you can swap IQFeed for any other internals source by re-pointing `IQFEED_BRIDGE_URL` at a different process — useful if you migrate to a different vendor later.

## Complete widget set (23)

| Widget | Purpose |
| --- | --- |
| Chart | Candlesticks + VWAP + EMA 20/50/100/200 + Supertrend + RSI / MACD / ADX sub-panel |
| TradingView | External advanced-chart embed (NQ / ES / RTY / YM, free, no account required) |
| AI Market Summary | Claude-generated bias / levels / scenarios / risks / patience (1m cadence) |
| AI Insights | Heuristic pattern + regime detection (no LLM cost) |
| Correlation Dashboard | 10×10 cross-asset correlation matrix |
| Heatmaps | Sectors / Mag 7 / Semis (Polygon when configured) |
| Multi-Timeframe Trend | 4 symbols × 6 timeframes |
| Market Overview | 11 instruments — price, daily %, change, sparkline |
| Market Internals | TICK / TRIN / A-D / ADD / Put-Call / Risk Regime (IQFeed bridge when configured) |
| Overnight & Key Levels | Asia/London/Overnight + PDH/PDL/PDC + PWH/PWL + PMH/PML + gap |
| Session Statistics | RTH high/low, range vs avg, IB high/low, breakout state, momentum |
| Volatility | VIX, VVIX, ATR(14, D), 20-day realized vol, range vs ATR%, 1D expected move |
| Volume Profile | 40-bin profile, POC, 70% value area (VAH / VAL) |
| Economic Calendar | High + medium impact events, sticky countdown to next print |
| News Feed | Filtered, categorized headlines |
| Options | GEX / Max Pain / dealer pos / expected move / largest OI strikes (Unusual Whales when configured) |
| Alerts | Price triggers with browser / Discord / SMS delivery |
| Watchlist | Sortable, per-row notes, persists locally |
| Position Size Calculator | Fixed-fractional risk + Tradovate order entry |
| Trading Journal | Log + edit trades; R-multiple + dollar PnL; Postgres sync if configured |
| Performance Analytics | Live: win rate, profit factor, expectancy, equity curve, R distribution |
| Backtester | EMA Cross + RSI Mean Reversion strategies over historical bars |
| Pre-Trade Checklist | 7-item discipline gate |

## V5-6 architecture

Each retired-synthetic surface follows the same pattern: a server route adapts the upstream vendor's response into the widget's existing shape; the client hook calls the route and merges with the synthesizer for any missing fields; the widget renders a `live` pill instead of `demo` only when the route reports `demo: false`.

```
app/api/
  heatmap/      # Polygon /v2/snapshot/locale/us/markets/stocks/tickers
  options/      # Unusual Whales /api/stock/{ticker}/{greek-exposure,max-pain,option-stats}
  internals/    # operator-run HTTP bridge wrapping IQConnect.exe
lib/hooks/
  use-heatmap.ts        # /api/heatmap with synthetic fallback
  use-options.ts        # /api/options merged over synthesizer
  use-internals.ts      # /api/internals polled at 1.5s when bridge live, else synthetic OU
```

## Phase plan

- ✅ **V1 / V2A / V2B-1 / V2B-2 / V2B-3** — Shell, charting, indicators, Tradovate adapter, derived levels
- ✅ **V3** — Economic Calendar + News + Options
- ✅ **V4** — AI Summary + AI Insights + Correlation + Heatmaps
- ✅ **V5-1** — Trading Journal + Performance Analytics
- ✅ **V5-2** — Supabase + Prisma sync
- ✅ **V5-3** — Alerts (browser / Discord / SMS)
- ✅ **V5-4** — Tradovate order entry + TradingView embed + webhook
- ✅ **V5-5** — Backtester (EMA Cross + RSI Mean Reversion)
- ✅ **V5-6** — Polygon heatmap + Unusual Whales options + IQFeed bridge internals (this release)

Full plan delivered. Ship it.
