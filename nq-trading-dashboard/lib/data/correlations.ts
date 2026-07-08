import type { Candle } from "../types";

export interface CorrelationCell {
  symbolA: string;
  symbolB: string;
  correlation: number; // -1..1
}

function logReturns(bars: Candle[]): number[] {
  const out: number[] = [];
  for (let i = 1; i < bars.length; i++) {
    const prev = bars[i - 1].close;
    if (prev > 0 && bars[i].close > 0) {
      out.push(Math.log(bars[i].close / prev));
    }
  }
  return out;
}

function pearson(a: number[], b: number[]): number {
  const n = a.length;
  if (n < 2) return 0;
  let ma = 0;
  let mb = 0;
  for (let i = 0; i < n; i++) {
    ma += a[i];
    mb += b[i];
  }
  ma /= n;
  mb /= n;
  let num = 0;
  let sa = 0;
  let sb = 0;
  for (let i = 0; i < n; i++) {
    const da = a[i] - ma;
    const db = b[i] - mb;
    num += da * db;
    sa += da * da;
    sb += db * db;
  }
  const den = Math.sqrt(sa * sb);
  return den ? num / den : 0;
}

export function pairwiseCorrelations(
  series: Record<string, Candle[]>,
): CorrelationCell[] {
  const symbols = Object.keys(series);
  const returns = new Map<string, number[]>();
  for (const s of symbols) returns.set(s, logReturns(series[s]));
  const cells: CorrelationCell[] = [];
  for (let i = 0; i < symbols.length; i++) {
    for (let j = 0; j < symbols.length; j++) {
      const a = returns.get(symbols[i])!;
      const b = returns.get(symbols[j])!;
      const n = Math.min(a.length, b.length);
      if (n < 5) {
        cells.push({ symbolA: symbols[i], symbolB: symbols[j], correlation: 0 });
        continue;
      }
      cells.push({
        symbolA: symbols[i],
        symbolB: symbols[j],
        correlation: pearson(a.slice(-n), b.slice(-n)),
      });
    }
  }
  return cells;
}
