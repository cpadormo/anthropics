// Synthetic market internals feed. Real NYSE/NASDAQ internals (TICK, TRIN,
// A/D, ADD, Put/Call) require a premium data plan (IQFeed, CME, or an OPRA
// link for Put/Call). V2B-2 ships an Ornstein-Uhlenbeck-flavored mock so the
// widget exercises the same shapes a real feed would push; V2B-3 swaps in a
// real source behind this same interface.

export interface Internals {
  nyseTick: number;
  nasdaqTick: number;
  trin: number;
  advanceDecline: number;
  addLine: number;
  putCall: number;
  riskOn: number; // -1..1 composite
  ts: number;
}

function clamp(v: number, min: number, max: number) {
  return Math.max(min, Math.min(max, v));
}

function gauss(): number {
  const u1 = Math.max(Math.random(), 1e-9);
  const u2 = Math.random();
  return Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
}

class InternalsFeed {
  private state: Internals = {
    nyseTick: 0,
    nasdaqTick: 0,
    trin: 1,
    advanceDecline: 0,
    addLine: 0,
    putCall: 0.9,
    riskOn: 0,
    ts: Date.now(),
  };
  private listeners = new Set<(s: Internals) => void>();
  private timer: ReturnType<typeof setInterval> | null = null;

  start() {
    if (this.timer) return;
    this.timer = setInterval(() => this.tick(), 1500);
  }

  private tick() {
    const theta = 0.18; // mean-reversion speed
    const tickSigma = 250;

    this.state.nyseTick = clamp(
      this.state.nyseTick * (1 - theta) + gauss() * tickSigma,
      -1500,
      1500,
    );
    this.state.nasdaqTick = clamp(
      this.state.nasdaqTick * (1 - theta) + gauss() * tickSigma,
      -1500,
      1500,
    );
    this.state.trin = clamp(
      this.state.trin + gauss() * 0.05 - (this.state.trin - 1) * 0.12,
      0.3,
      3,
    );
    const adChange = Math.round(gauss() * 400);
    this.state.advanceDecline = clamp(adChange, -3000, 3000);
    this.state.addLine += adChange;
    this.state.putCall = clamp(
      this.state.putCall + gauss() * 0.02 - (this.state.putCall - 0.9) * 0.08,
      0.4,
      1.6,
    );
    this.state.riskOn = Math.tanh(
      (this.state.nyseTick + this.state.nasdaqTick) / 2000 +
        (1 - this.state.trin) * 0.5 +
        (0.9 - this.state.putCall) * 0.8,
    );
    this.state.ts = Date.now();

    for (const cb of this.listeners) cb(this.state);
  }

  subscribe(cb: (s: Internals) => void): () => void {
    this.listeners.add(cb);
    queueMicrotask(() => cb(this.state));
    return () => {
      this.listeners.delete(cb);
    };
  }
}

let _feed: InternalsFeed | null = null;
export function getInternalsFeed(): InternalsFeed {
  if (!_feed) {
    _feed = new InternalsFeed();
    if (typeof window !== "undefined") _feed.start();
  }
  return _feed;
}
