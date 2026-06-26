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
//   e.g.  authorize\n1\n\n{accessToken}
//         md/subscribequote\n2\n\n{"symbol":"NQU6"}
//
// Quote events arrive as { e: "md", d: { quotes: [{ contractId, entries, ... }] } }.
// Subscribe responses include the contractId for the requested symbol; we cache
// the mapping to associate later events back to the human-readable symbol.

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
        // Socket open. Authorize and (re)subscribe everything.
        this.send(`authorize\n${++this.requestId}\n\n${this.auth!.mdAccessToken}`);
        this.startHeartbeat();
        for (const sym of this.subscribers.keys()) this.subscribeOnWire(sym);
        this.reconnectDelayMs = 1000;
        return;
      case "h":
        // Server heartbeat. Reply to keep the link warm.
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
    // Subscribe response: maps contractId -> symbol
    if (f.s === 200 && f.d && typeof f.d === "object") {
      const cid = f.d.contractId as number | undefined;
      const sym = f.d.symbol as string | undefined;
      if (cid && sym) {
        this.contractToSymbol.set(cid, sym);
        this.symbolToContract.set(sym, cid);
      }
    }
    if (f.e === "md" && f.d?.quotes) {
      for (const q of f.d.quotes) this.applyQuote(q);
    }
  }

  private applyQuote(raw: any) {
    const sym = this.contractToSymbol.get(raw.contractId);
    if (!sym) return;
    const e = raw.entries ?? {};
    const prev = this.latest.get(sym);
    const next: TradoQuote = {
      symbol: sym,
      bid:        e.Bid?.price        ?? prev?.bid,
      ask:        e.Offer?.price      ?? prev?.ask,
      bidSize:    e.Bid?.size         ?? prev?.bidSize,
      askSize:    e.Offer?.size       ?? prev?.askSize,
      last:       e.Trade?.price      ?? prev?.last,
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

  subscribe(symbol: string, cb: QuoteCallback): () => void {
    let set = this.subscribers.get(symbol);
    if (!set) {
      set = new Set();
      this.subscribers.set(symbol, set);
      this.subscribeOnWire(symbol);
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

  latestQuote(symbol: string): TradoQuote | null {
    return this.latest.get(symbol) ?? null;
  }

  close() {
    this.closed = true;
    if (this.heartbeatTimer) clearInterval(this.heartbeatTimer);
    this.ws?.close();
  }

  private subscribeOnWire(symbol: string) {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) return;
    this.send(
      `md/subscribequote\n${++this.requestId}\n\n${JSON.stringify({ symbol })}`,
    );
  }

  private send(text: string) {
    if (this.ws?.readyState === WebSocket.OPEN) {
      // SockJS-style: text payloads are JSON-stringified strings.
      this.ws.send(JSON.stringify(text));
    }
  }

  private startHeartbeat() {
    if (this.heartbeatTimer) return;
    // Lightweight ping keeps the socket alive between server heartbeats.
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
