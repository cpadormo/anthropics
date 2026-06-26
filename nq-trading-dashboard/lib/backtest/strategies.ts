import { atr, ema, rsi } from "../indicators";
import type { Strategy } from "./engine";

export interface EmaCrossParams {
  fast: number;
  slow: number;
  atrPeriod: number;
  atrMult: number;
  rrTarget: number;
}

interface EmaCrossPrepared {
  fast: (number | null)[];
  slow: (number | null)[];
  atr: (number | null)[];
}

export const emaCrossStrategy: Strategy<EmaCrossParams> = {
  id: "ema-cross",
  label: "EMA Cross (trend-follow)",
  defaults: { fast: 9, slow: 21, atrPeriod: 14, atrMult: 1.5, rrTarget: 2 },
  prepare(bars, params) {
    const closes = bars.map((b) => b.close);
    return {
      fast: ema(closes, params.fast),
      slow: ema(closes, params.slow),
      atr: atr(bars, params.atrPeriod),
    } satisfies EmaCrossPrepared;
  },
  step(ctx, params, prepared) {
    const p = prepared as EmaCrossPrepared;
    const { i } = ctx;
    const f = p.fast[i];
    const fPrev = p.fast[i - 1];
    const s = p.slow[i];
    const sPrev = p.slow[i - 1];
    const a = p.atr[i];
    if (f == null || fPrev == null || s == null || sPrev == null || a == null) {
      return {};
    }
    const close = ctx.bars[i].close;
    // Exit on opposing cross even before stop / target.
    if (ctx.position) {
      const crossDn = fPrev >= sPrev && f < s;
      const crossUp = fPrev <= sPrev && f > s;
      if (ctx.position.side === "long" && crossDn) return { exit: { reason: "signal" } };
      if (ctx.position.side === "short" && crossUp) return { exit: { reason: "signal" } };
      return {};
    }
    const crossUp = fPrev <= sPrev && f > s;
    const crossDn = fPrev >= sPrev && f < s;
    if (crossUp) {
      const stop = close - params.atrMult * a;
      const risk = close - stop;
      const target = close + risk * params.rrTarget;
      return { enter: { side: "long", stop, target } };
    }
    if (crossDn) {
      const stop = close + params.atrMult * a;
      const risk = stop - close;
      const target = close - risk * params.rrTarget;
      return { enter: { side: "short", stop, target } };
    }
    return {};
  },
};

export interface RsiMeanReversionParams {
  rsiPeriod: number;
  oversold: number;
  overbought: number;
  exitLevel: number;
  atrPeriod: number;
  atrMult: number;
}

interface RsiPrepared {
  rsi: (number | null)[];
  atr: (number | null)[];
}

export const rsiMeanReversionStrategy: Strategy<RsiMeanReversionParams> = {
  id: "rsi-mean-reversion",
  label: "RSI Mean Reversion (counter-trend)",
  defaults: {
    rsiPeriod: 14,
    oversold: 30,
    overbought: 70,
    exitLevel: 50,
    atrPeriod: 14,
    atrMult: 2,
  },
  prepare(bars, params) {
    const closes = bars.map((b) => b.close);
    return {
      rsi: rsi(closes, params.rsiPeriod),
      atr: atr(bars, params.atrPeriod),
    } satisfies RsiPrepared;
  },
  step(ctx, params, prepared) {
    const p = prepared as RsiPrepared;
    const { i } = ctx;
    const r = p.rsi[i];
    const a = p.atr[i];
    if (r == null || a == null) return {};
    const close = ctx.bars[i].close;
    if (ctx.position) {
      if (ctx.position.side === "long" && r >= params.exitLevel) {
        return { exit: { reason: "signal" } };
      }
      if (ctx.position.side === "short" && r <= params.exitLevel) {
        return { exit: { reason: "signal" } };
      }
      return {};
    }
    if (r <= params.oversold) {
      const stop = close - params.atrMult * a;
      return { enter: { side: "long", stop, target: null } };
    }
    if (r >= params.overbought) {
      const stop = close + params.atrMult * a;
      return { enter: { side: "short", stop, target: null } };
    }
    return {};
  },
};

export const STRATEGIES = {
  "ema-cross": emaCrossStrategy,
  "rsi-mean-reversion": rsiMeanReversionStrategy,
} as const;

export type StrategyId = keyof typeof STRATEGIES;
