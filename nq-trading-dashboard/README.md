# NQ Desk — Trading Dashboard

Professional discretionary trading cockpit, optimized for Nasdaq-100 E-mini and Micro E-mini futures (NQ / MNQ).

> **Status: V5-5** — 23 widgets live. Backtester closes out the V5 plan apart from V5-6 (retire remaining synthetic feeds). The dashboard now runs offline with localStorage, sync-upgrades to Supabase when a DB is configured, streams live Tradovate quotes + candles + orders, generates AI summaries, fires alerts to browser / Discord / SMS, and backtests strategies over historical bars.

## Quick start

```bash
npm install
npm run dev
# open http://localhost:3000
```

No API keys required. The dashboard ships with sensible mock data for every external surface so you can build the layout and learn the keys before wiring real providers.

## Enable real data, surface by surface

| Surface | Env to set |
| --- | --- |
| Live CME quotes + historical candles + order entry | `NEXT_PUBLIC_DATA_PROVIDER=tradovate` + `TRADOVATE_USERNAME / PASSWORD / CID / SECRET` |
| Economic Calendar + News Feed | `FINNHUB_API_KEY` |
| AI Market Summary | `ANTHROPIC_API_KEY` (default model `claude-sonnet-4-6`, override via `ANTHROPIC_MODEL`) |
| Journal + layout sync | `DATABASE_URL` (Supabase / any Postgres), then `npm run db:generate && npm run db:push` |
| Alert channels | `DISCORD_WEBHOOK_URL` and / or `TWILIO_ACCOUNT_SID / AUTH_TOKEN / FROM_NUMBER / TO_NUMBER` |
| TradingView alert webhook | `TRADINGVIEW_WEBHOOK_SECRET` (validated on POST to `/api/tradingview/webhook?secret=...`) |

## Complete widget set (23)

| Widget | Purpose |
| --- | --- |
| Chart | Candlesticks + VWAP + EMA 20/50/100/200 + Supertrend + RSI / MACD / ADX sub-panel |
| TradingView | External advanced-chart embed (NQ / ES / RTY / YM, free, no account required) |
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
| Alerts | Price triggers with browser / Discord / SMS delivery |
| Watchlist | Sortable, per-row notes, persists locally |
| Position Size Calculator | Fixed-fractional risk + Tradovate order entry (Buy / Sell / Market / Limit / Stop) |
| Trading Journal | Log + edit trades; R-multiple + dollar PnL; syncs to Postgres if configured |
| Performance Analytics | Live: win rate, profit factor, expectancy, equity curve, R distribution |
| Backtester | EMA Cross + RSI Mean Reversion strategies over historical bars; same stats path as live analytics |
| Pre-Trade Checklist | 7-item discipline gate |

## V5-5 architecture

```
lib/backtest/
  engine.ts          # runBacktest(bars, strategy, params) + toJournalTrades
  strategies.ts      # ema-cross + rsi-mean-reversion (typed defaults, prepare + step)
lib/hooks/use-backtest.ts
components/widgets/backtest.tsx
```

The engine is intentionally tiny: walk bars, check intrabar stop / target, ask the strategy for an entry / exit signal, repeat. Strategies expose `prepare(bars, params)` to memoize indicator series once and `step(ctx, params, prepared)` to return signals per bar. Adding a new strategy is one file in `lib/backtest/strategies.ts`.

Because `toJournalTrades` converts backtest output into Journal `Trade` records, the same `computeStats` function powers both the live Analytics widget and the Backtester results panel. The two cards look and behave identically.

## Phase plan

- ✅ **V1 / V2A / V2B-1 / V2B-2 / V2B-3** — Shell, charting, indicators, Tradovate adapter, derived levels
- ✅ **V3** — Economic Calendar + News + Options
- ✅ **V4** — AI Summary + AI Insights + Correlation + Heatmaps
- ✅ **V5-1** — Trading Journal + Performance Analytics (localStorage)
- ✅ **V5-2** — Supabase + Prisma sync for journal & layout
- ✅ **V5-3** — Alerts with browser, Discord, SMS channels
- ✅ **V5-4** — Tradovate order entry + TradingView embed + webhook receiver
- ✅ **V5-5** — Backtester (this release)
- **V5-6** — Retire remaining synthetic surfaces: real Market Internals (IQFeed), real options feed (SpotGamma / Unusual Whales), real heatmap constituents (Polygon / IEX). Requires paid subscriptions; deferred until you commit to providers.
