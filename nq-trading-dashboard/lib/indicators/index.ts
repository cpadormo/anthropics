import type { Candle } from "../types";

// Simple moving average. Returns same-length array with leading nulls.
export function sma(values: number[], period: number): (number | null)[] {
  const out: (number | null)[] = new Array(values.length).fill(null);
  if (period <= 0 || values.length < period) return out;
  let sum = 0;
  for (let i = 0; i < values.length; i++) {
    sum += values[i];
    if (i >= period) sum -= values[i - period];
    if (i >= period - 1) out[i] = sum / period;
  }
  return out;
}

// Exponential moving average, seeded with SMA of first `period` values.
export function ema(values: number[], period: number): (number | null)[] {
  const out: (number | null)[] = new Array(values.length).fill(null);
  if (period <= 0 || values.length < period) return out;
  const k = 2 / (period + 1);
  let seed = 0;
  for (let i = 0; i < period; i++) seed += values[i];
  out[period - 1] = seed / period;
  for (let i = period; i < values.length; i++) {
    out[i] = values[i] * k + (out[i - 1] as number) * (1 - k);
  }
  return out;
}

// Session VWAP using typical price * volume.
export function vwap(candles: Candle[]): (number | null)[] {
  const out: (number | null)[] = new Array(candles.length).fill(null);
  let cumPV = 0;
  let cumV = 0;
  for (let i = 0; i < candles.length; i++) {
    const c = candles[i];
    const typical = (c.high + c.low + c.close) / 3;
    cumPV += typical * c.volume;
    cumV += c.volume;
    out[i] = cumV > 0 ? cumPV / cumV : null;
  }
  return out;
}

// Wilder-smoothed RSI.
export function rsi(values: number[], period = 14): (number | null)[] {
  const out: (number | null)[] = new Array(values.length).fill(null);
  if (values.length <= period) return out;
  let avgGain = 0;
  let avgLoss = 0;
  for (let i = 1; i <= period; i++) {
    const diff = values[i] - values[i - 1];
    if (diff >= 0) avgGain += diff;
    else avgLoss -= diff;
  }
  avgGain /= period;
  avgLoss /= period;
  out[period] = avgLoss === 0 ? 100 : 100 - 100 / (1 + avgGain / avgLoss);
  for (let i = period + 1; i < values.length; i++) {
    const diff = values[i] - values[i - 1];
    const gain = diff > 0 ? diff : 0;
    const loss = diff < 0 ? -diff : 0;
    avgGain = (avgGain * (period - 1) + gain) / period;
    avgLoss = (avgLoss * (period - 1) + loss) / period;
    out[i] = avgLoss === 0 ? 100 : 100 - 100 / (1 + avgGain / avgLoss);
  }
  return out;
}

export interface MacdResult {
  macd: (number | null)[];
  signal: (number | null)[];
  hist: (number | null)[];
}

export function macd(values: number[], fast = 12, slow = 26, signal = 9): MacdResult {
  const fastE = ema(values, fast);
  const slowE = ema(values, slow);
  const macdLine: (number | null)[] = values.map((_, i) => {
    const f = fastE[i];
    const s = slowE[i];
    return f != null && s != null ? f - s : null;
  });
  // Signal is EMA of macd line over the region where macd is defined.
  const firstIdx = macdLine.findIndex((v) => v != null);
  const signalLine: (number | null)[] = new Array(values.length).fill(null);
  if (firstIdx >= 0) {
    const sliced = macdLine.slice(firstIdx).map((v) => v as number);
    const sig = ema(sliced, signal);
    for (let i = 0; i < sig.length; i++) signalLine[firstIdx + i] = sig[i];
  }
  const hist: (number | null)[] = macdLine.map((v, i) =>
    v == null || signalLine[i] == null ? null : v - (signalLine[i] as number),
  );
  return { macd: macdLine, signal: signalLine, hist };
}

// Wilder-smoothed Average True Range.
export function atr(candles: Candle[], period = 14): (number | null)[] {
  const out: (number | null)[] = new Array(candles.length).fill(null);
  if (candles.length < period) return out;
  const tr: number[] = new Array(candles.length);
  tr[0] = candles[0].high - candles[0].low;
  for (let i = 1; i < candles.length; i++) {
    const c = candles[i];
    const pc = candles[i - 1].close;
    tr[i] = Math.max(c.high - c.low, Math.abs(c.high - pc), Math.abs(c.low - pc));
  }
  let sum = 0;
  for (let i = 0; i < period; i++) sum += tr[i];
  out[period - 1] = sum / period;
  for (let i = period; i < candles.length; i++) {
    out[i] = ((out[i - 1] as number) * (period - 1) + tr[i]) / period;
  }
  return out;
}

export interface TrendSignal {
  direction: "bull" | "bear" | "neutral";
  strength: number; // 0..1
  fast: number;
  slow: number;
  spread: number; // (fast - slow) / slow
}

// Classification from fast/slow EMA spread. Thresholds are deliberately
// small to surface persistent regimes without flickering on noise.
export function trendFromEMA(
  values: number[],
  fast = 20,
  slow = 50,
  neutralBand = 0.0008,
  fullScale = 0.01,
): TrendSignal | null {
  if (values.length < slow) return null;
  const f = ema(values, fast);
  const s = ema(values, slow);
  const i = values.length - 1;
  const fv = f[i];
  const sv = s[i];
  if (fv == null || sv == null) return null;
  const spread = (fv - sv) / sv;
  const direction =
    spread > neutralBand ? "bull" : spread < -neutralBand ? "bear" : "neutral";
  const strength = Math.min(1, Math.abs(spread) / fullScale);
  return { direction, strength, fast: fv, slow: sv, spread };
}
