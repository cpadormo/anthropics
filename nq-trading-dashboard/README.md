# NQ Desk — Trading Dashboard

Professional discretionary trading cockpit, optimized for Nasdaq-100 E-mini and Micro E-mini futures (NQ / MNQ).

> **Status: V5-2** — Supabase + Prisma sync wired for the trading journal and dashboard layout. Storage now upgrades automatically: localStorage when no DB is configured, Postgres when `DATABASE_URL` is set. Widgets are unchanged.

## Quick start

```bash
npm install
npm run dev
# open http://localhost:3000
```

No API keys required to run. Top bar shows the data feed; widgets display "demo" / "local" pills where data is synthetic or stored client-side.

## Enable Supabase / Postgres sync (V5-2)

1. Create a Supabase project (or point at any Postgres database).
2. Add the connection string to `.env.local`:
   ```bash
   DATABASE_URL=postgresql://postgres:password@db.<project>.supabase.co:5432/postgres
   ```
3. Generate the Prisma client and push the schema (one-time):
   ```bash
   npm run db:generate
   npm run db:push
   ```
4. Restart `npm run dev`. The Trading Journal and the dashboard layout will sync to Postgres instead of localStorage automatically.

**How it works.** `/api/health` reports which providers are configured; the client probes once on mount and routes journal CRUD + layout reads/writes accordingly. If `DATABASE_URL` is set but Prisma hasn't been generated, the routes return 503 and the client falls back to localStorage with no UX change.

**Security note.** V5-2 uses a single hardcoded `userId="local"` for now — it's a single-user, single-device dashboard. V5-3+ will wire Supabase Auth for multi-user / multi-device.

## Enable other providers

```bash
# Tradovate — live CME quotes + historical candles
NEXT_PUBLIC_DATA_PROVIDER=tradovate
TRADOVATE_USERNAME=...
TRADOVATE_PASSWORD=...
TRADOVATE_CID=...
TRADOVATE_SECRET=...

# Finnhub — Economic Calendar + News
FINNHUB_API_KEY=...

# Anthropic — AI Market Summary
ANTHROPIC_API_KEY=...
ANTHROPIC_MODEL=claude-sonnet-4-6
```

## Complete widget set (20)

Unchanged from V5-1 — see Git history for the full set. The journal and layout are the only surfaces that gained DB persistence in V5-2.

## Architecture additions (V5-2)

```
app/api/
  health/                 # which providers are configured
  journal/                # GET, POST  (DB-backed)
  journal/[id]/           # PATCH, DELETE
  settings/layout/        # GET, PUT
lib/db/
  client.ts               # lazy/optional Prisma singleton
  repo.ts                 # listTrades / createTrade / updateTrade / deleteTrade / getLayout / setLayout
lib/hooks/
  use-db-mode.ts          # checking | db | local, cached module-globally
prisma/
  schema.prisma           # Trade / Watchlist / Alert / UserSetting on Postgres
next.config.mjs           # serverComponentsExternalPackages for @prisma/client
```

## Phase plan

- ✅ **V1 / V2A / V2B-1 / V2B-2 / V2B-3** — Shell, charting, indicators, Tradovate adapter, derived levels
- ✅ **V3** — Economic Calendar + News + Options
- ✅ **V4** — AI Summary + AI Insights + Correlation + Heatmaps
- ✅ **V5-1** — Trading Journal + Performance Analytics (localStorage)
- ✅ **V5-2** — Supabase + Prisma sync for journal & layout (this release)
- **V5-3** — Alerts (price / level / indicator / event triggers) with browser notifications + Discord / Twilio (SMS) channels.
- **V5-4** — Tradovate order entry from the Position Calculator + TradingView chart embed / webhook receiver.
- **V5-5** — Rule-based backtester over historical Tradovate bars.
- **V5-6** — Retire remaining synthetic surfaces: real Market Internals (IQFeed), real options feed (SpotGamma / Unusual Whales), real heatmap constituents (Polygon / IEX).
