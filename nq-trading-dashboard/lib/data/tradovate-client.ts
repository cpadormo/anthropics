// Tradovate market-data WebSocket client.
//
// Protocol summary (SockJS-style framing):
//   server -> client text frames start with a single char prefix:
//     'o'        socket opened, ready for auth
//     'h'        server heartbeat
//     'a[...]'   array of JSON frames
//     'c[...]'   server-initiated close
//   client -> server frames are JSON-stringified text payloads, each shaped:
//     endpoint\nrequestId\nquery\nbody
//
// Endpoints used here:
//   authorize        — hand over mdAccessToken
//   md/subscribequote / md/unsubscribequote
//   md/getChart      — historical bars + live updates for a (symbol, tf)
//   md/cancelChart   — stop a chart subscription
//
// Chart events arrive as { e: "chart", d: { charts: [{ id, bars, eoh }] } }.
// We map both realtimeId and historicalId returned from the subscribe
// response back to the same internal ChartSub so historical backfill and
// live updates share one accumulator.

import type { Candle } from "../types";

const WS_URL = (env: string) =>
  env === "live"
    ? "wss://md.tradovateapi.com/v1/websocket"
    : "wss://md-demo.tradovateapi.com/v1/websocket";

export interface TradoQuote {
  symbol: string;
  bid?: number;
  ask?: number;
  bidSize?: number;
  askSize?: number;
  last?: number;
  volume?: number;
  open?: number;
  high?: number;
  low?: number;
  settlement?: number;
  ts: number;
}

type QuoteCallback = (q: TradoQuote) => void;
type BarsCallback = (bars: Candle[]) => void;

export interface ChartRequest {
  symbol: string;
  underlyingType: "MinuteBar" | "DailyBar";
  elementSize: number;
  count: number;
}

interface ChartSub {
  requestId: number;
  req: ChartRequest;
  onBars: BarsCallback;
  subIds: number[];
}

interface AuthResponse {
  mdAccessToken: string;
  env: string;
  expiration?: string;
}

export class TradovateClient {
  private ws: WebSocket | null = null;
  private requestId = 0;
  private subscribers = new Map<string, Set<QuoteCallback>>();
  private contractToSymbol = new Map<number, string>();
  private symbolToContract = new Map<string, number>();
  private latest = new Map<string, TradoQuote>();
  private chartReqById = new Map<number, ChartSub>();
  private chartReqBySubId = new Map<number, ChartSub>();
  private auth: AuthResponse | null = null;
  private heartbeatTimer: ReturnType<typeof setInterval> | null = null;
  private reconnectDelayMs = 1000;
  private closed = false;

  async connect(): Promise<void> {
    const res = await fetch("/api/tradovate/auth", { method: "POST" });
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      throw new Error(`Tradovate auth failed (${res.status}): ${body.error ?? "unknown"}`);
    }
    this.auth = (await res.json()) as AuthResponse;
    this.openSocket();
  }

  private openSocket() {
    if (!this.auth || typeof WebSocket === "undefined") return;
    const ws = new WebSocket(WS_URL(this.auth.env));
    this.ws = ws;
    ws.onmessage = (ev) => this.onMessage(String(ev.data));
    ws.onclose = () => this.handleDisconnect();
    ws.onerror = () => { /* surfaces via onclose */ };
  }

  private onMessage(raw: string) {
    if (!raw) return;
    const prefix = raw[0];
    const body = raw.slice(1);
    switch (prefix) {
      case "o":
        this.send(`authorize\n${++this.requestId}\n\n${this.auth!.mdAccessToken}`);
        this.startHeartbeat();
        for (const sym of this.subscribers.keys()) this.subscribeQuoteOnWire(sym);
        // Replay any chart subscriptions with fresh requestIds; subIds reset.
        const oldChartSubs = [...this.chartReqById.values()];
        this.chartReqById.clear();
        this.chartReqBySubId.clear();
        for (const sub of oldChartSubs) {
          sub.subIds = [];
          this.startChartOnWire(sub);
        }
        this.reconnectDelayMs = 1000;
        return;
      case "h":
        this.send("[]");
        return;
      case "a":
        try {
          const frames = JSON.parse(body) as unknown[];
          for (const f of frames) this.handleFrame(f);
        } catch {
          /* swallow malformed */
        }
        return;
      case "c":
        this.ws?.close();
        return;
    }
  }

  private handleFrame(frame: unknown) {
    if (!frame || typeof frame !== "object") return;
    const f = frame as {
      e?: string;
      d?: any;
      s?: number;
      i?: number;
    };

    // Subscribe response handling
    if (f.s === 200 && f.i != null && f.d && typeof f.d === "object") {
      // Quote subscribe -> contractId / symbol mapping
      const cid = f.d.contractId as number | undefined;
      const sym = f.d.symbol as string | undefined;
      if (cid && sym) {
        this.contractToSymbol.set(cid, sym);
        this.symbolToContract.set(sym, cid);
      }
      // Chart subscribe response -> capture realtimeId / historicalId / subscriptionId
      const chartSub = this.chartReqById.get(f.i);
      if (chartSub) {
        for (const key of ["realtimeId", "historicalId", "subscriptionId"]) {
          const sid = f.d[key] as number | undefined;
          if (typeof sid === "number") {
            chartSub.subIds.push(sid);
            this.chartReqBySubId.set(sid, chartSub);
          }
        }
      }
    }

    if (f.e === "md" && f.d?.quotes) {
      for (const q of f.d.quotes) this.applyQuote(q);
    }
    if (f.e === "chart" && f.d?.charts) {
      for (const chart of f.d.charts) this.applyChart(chart);
    }
  }

  private applyQuote(raw: any) {
    const sym = this.contractToSymbol.get(raw.contractId);
    if (!sym) return;
    const e = raw.entries ?? {};
    const prev = this.latest.get(sym);
    const next: TradoQuote = {
      symbol: sym,
      bid:        e.Bid?.price             ?? prev?.bid,
      ask:        e.Offer?.price           ?? prev?.ask,
      bidSize:    e.Bid?.size              ?? prev?.bidSize,
      askSize:    e.Offer?.size            ?? prev?.askSize,
      last:       e.Trade?.price           ?? prev?.last,
      volume:     e.TotalTradeVolume?.size ?? prev?.volume,
      open:       e.OpeningPrice?.price    ?? prev?.open,
      high:       e.HighPrice?.price       ?? prev?.high,
      low:        e.LowPrice?.price        ?? prev?.low,
      settlement: e.SettlementPrice?.price ?? prev?.settlement,
      ts: Date.parse(raw.timestamp) || Date.now(),
    };
    this.latest.set(sym, next);
    const subs = this.subscribers.get(sym);
    if (subs) for (const cb of subs) cb(next);
  }

  private applyChart(chart: any) {
    const id = chart?.id;
    if (typeof id !== "number") return;
    const sub = this.chartReqBySubId.get(id);
    if (!sub) return;
    const rawBars = (chart.bars ?? []) as any[];
    if (!rawBars.length) return;
    const bars: Candle[] = rawBars.map((b) => ({
      ts:
        typeof b.timestamp === "string"
          ? Date.parse(b.timestamp)
          : typeof b.timestamp === "number"
            ? b.timestamp
            : Date.now(),
      open: Number(b.open),
      high: Number(b.high),
      low: Number(b.low),
      close: Number(b.close),
      volume:
        Number(b.upVolume ?? 0) + Number(b.downVolume ?? 0) ||
        Number(b.volume ?? 0) ||
        Number(b.bidVolume ?? 0) + Number(b.offerVolume ?? 0) ||
        0,
    }));
    sub.onBars(bars);
  }

  subscribe(symbol: string, cb: QuoteCallback): () => void {
    let set = this.subscribers.get(symbol);
    if (!set) {
      set = new Set();
      this.subscribers.set(symbol, set);
      this.subscribeQuoteOnWire(symbol);
    }
    set.add(cb);
    const cached = this.latest.get(symbol);
    if (cached) queueMicrotask(() => cb(cached));
    return () => {
      set!.delete(cb);
      if (set!.size === 0) {
        this.subscribers.delete(symbol);
        if (this.ws?.readyState === WebSocket.OPEN) {
          this.send(
            `md/unsubscribequote\n${++this.requestId}\n\n${JSON.stringify({ symbol })}`,
          );
        }
      }
    };
  }

  subscribeChart(req: ChartRequest, onBars: BarsCallback): () => void {
    const requestId = ++this.requestId;
    const sub: ChartSub = { requestId, req, onBars, subIds: [] };
    this.chartReqById.set(requestId, sub);
    this.startChartOnWire(sub);
    return () => {
      for (const sid of sub.subIds) {
        this.chartReqBySubId.delete(sid);
        if (this.ws?.readyState === WebSocket.OPEN) {
          this.send(
            `md/cancelChart\n${++this.requestId}\n\n${JSON.stringify({ subscriptionId: sid })}`,
          );
        }
      }
      this.chartReqById.delete(requestId);
    };
  }

  latestQuote(symbol: string): TradoQuote | null {
    return this.latest.get(symbol) ?? null;
  }

  close() {
    this.closed = true;
    if (this.heartbeatTimer) clearInterval(this.heartbeatTimer);
    this.ws?.close();
  }

  private subscribeQuoteOnWire(symbol: string) {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) return;
    this.send(
      `md/subscribequote\n${++this.requestId}\n\n${JSON.stringify({ symbol })}`,
    );
  }

  private startChartOnWire(sub: ChartSub) {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) return;
    const body = JSON.stringify({
      symbol: sub.req.symbol,
      chartDescription: {
        underlyingType: sub.req.underlyingType,
        elementSize: sub.req.elementSize,
        elementSizeUnit: "UnderlyingUnits",
      },
      timeRange: { asMuchAsElements: sub.req.count },
    });
    this.send(`md/getChart\n${sub.requestId}\n\n${body}`);
  }

  private send(text: string) {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(text));
    }
  }

  private startHeartbeat() {
    if (this.heartbeatTimer) return;
    this.heartbeatTimer = setInterval(() => this.send("[]"), 2500);
  }

  private handleDisconnect() {
    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer);
      this.heartbeatTimer = null;
    }
    if (this.closed) return;
    setTimeout(() => this.openSocket(), this.reconnectDelayMs);
    this.reconnectDelayMs = Math.min(this.reconnectDelayMs * 2, 30000);
  }
}
