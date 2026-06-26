import { nanoid } from "nanoid";
import type { Candle } from "../types";
import type { Trade } from "../data/journal";

export type Side = "long" | "short";

export interface BacktestTrade {
  entryIdx: number;
  exitIdx: number;
  side: Side;
  entry: number;
  exit: number;
  stop: number;
  target: number | null;
  pnlPoints: number;
  rMultiple: number;
  outcome: "win" | "loss" | "breakeven";
  reason: "stop" | "target" | "signal" | "timeout";
}

export interface OpenPosition {
  side: Side;
  entry: number;
  stop: number;
  target: number | null;
  entryIdx: number;
}

export interface StrategyContext {
  bars: Candle[];
  i: number;
  position: OpenPosition | null;
}

export interface StrategySignal {
  // Returned by a strategy at each bar.
  enter?: { side: Side; stop: number; target: number | null };
  exit?: { reason: "signal" | "timeout" };
}

export interface Strategy<P = unknown> {
  id: string;
  label: string;
  defaults: P;
  prepare(bars: Candle[], params: P): unknown;
  step(ctx: StrategyContext, params: P, prepared: unknown): StrategySignal;
}

export function runBacktest<P>(
  bars: Candle[],
  strategy: Strategy<P>,
  params: P,
): BacktestTrade[] {
  const trades: BacktestTrade[] = [];
  let position: OpenPosition | null = null;
  const prepared = strategy.prepare(bars, params);

  function close(
    exitIdx: number,
    exit: number,
    reason: BacktestTrade["reason"],
  ) {
    if (!position) return;
    const dir = position.side === "long" ? 1 : -1;
    const pnlPoints = (exit - position.entry) * dir;
    const risk = Math.abs(position.entry - position.stop);
    const rMultiple = risk > 0 ? pnlPoints / risk : 0;
    const outcome: BacktestTrade["outcome"] =
      Math.abs(rMultiple) < 0.05 ? "breakeven" : rMultiple > 0 ? "win" : "loss";
    trades.push({
      entryIdx: position.entryIdx,
      exitIdx,
      side: position.side,
      entry: position.entry,
      exit,
      stop: position.stop,
      target: position.target,
      pnlPoints,
      rMultiple,
      outcome,
      reason,
    });
    position = null;
  }

  for (let i = 1; i < bars.length; i++) {
    const bar = bars[i];

    // Intrabar stop / target check first — conservative: stop is checked
    // before target when both could have hit on the same bar.
    if (position) {
      if (position.side === "long") {
        if (bar.low <= position.stop) {
          close(i, position.stop, "stop");
        } else if (position.target != null && bar.high >= position.target) {
          close(i, position.target, "target");
        }
      } else {
        if (bar.high >= position.stop) {
          close(i, position.stop, "stop");
        } else if (position.target != null && bar.low <= position.target) {
          close(i, position.target, "target");
        }
      }
    }

    const signal = strategy.step({ bars, i, position }, params, prepared);

    if (position && signal.exit) {
      close(i, bar.close, signal.exit.reason);
    }

    if (!position && signal.enter) {
      position = {
        side: signal.enter.side,
        entry: bar.close,
        stop: signal.enter.stop,
        target: signal.enter.target,
        entryIdx: i,
      };
    }
  }

  // Time-out any open position at the final bar for clean accounting.
  if (position) {
    close(bars.length - 1, bars[bars.length - 1].close, "timeout");
  }

  return trades;
}

export function toJournalTrades(
  backtest: BacktestTrade[],
  symbol: string,
  pointValue: number,
  bars: Candle[],
): Trade[] {
  return backtest.map((t) => {
    const pnlDollars = t.pnlPoints * pointValue;
    return {
      id: nanoid(),
      symbol,
      side: t.side,
      entryTime: bars[t.entryIdx]?.ts ?? Date.now(),
      exitTime: bars[t.exitIdx]?.ts ?? Date.now(),
      entry: t.entry,
      exit: t.exit,
      contracts: 1,
      stopLoss: t.stop,
      takeProfit: t.target,
      pointValue,
      pnlPoints: t.pnlPoints,
      pnlDollars,
      rMultiple: t.rMultiple,
      setup: null,
      tags: [t.reason],
      notes: "",
      createdAt: Date.now(),
    };
  });
}
