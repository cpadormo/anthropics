import { ema } from "../indicators";
import type { Candle, RthSessionStats, SessionLevels } from "../types";

export interface Insight {
  id: string;
  label: string;
  description: string;
  tone: "bull" | "bear" | "warn" | "info";
  confidence: number; // 0..1
}

export interface InsightInputs {
  intraday1m: Candle[];
  dailyBars: Candle[];
  rthStats: RthSessionStats | null;
  sessionLevels: SessionLevels | null;
  vixChangePct: number;
}

function etParts(ts: number) {
  const d = new Date(ts);
  const fmt = new Intl.DateTimeFormat("en-US", {
    timeZone: "America/New_York",
    hour12: false,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
  const parts = fmt.formatToParts(d);
  const get = (t: string) => {
    const p = parts.find((x) => x.type === t);
    return p ? parseInt(p.value, 10) : 0;
  };
  const rawHour = get("hour");
  return {
    year: get("year"),
    month: get("month"),
    day: get("day"),
    hour: rawHour === 24 ? 0 : rawHour,
    minute: get("minute"),
  };
}

function etDateKey(ts: number): string {
  const p = etParts(ts);
  return `${p.year}-${String(p.month).padStart(2, "0")}-${String(p.day).padStart(2, "0")}`;
}

function todaysRthBars(bars: Candle[]): Candle[] {
  const today = etDateKey(Date.now());
  return bars.filter((b) => {
    if (etDateKey(b.ts) !== today) return false;
    const p = etParts(b.ts);
    const h = p.hour + p.minute / 60;
    return h >= 9.5 && h < 16;
  });
}

function highLow(bars: Candle[]): { high: number; low: number } | null {
  if (!bars.length) return null;
  let high = bars[0].high;
  let low = bars[0].low;
  for (let i = 1; i < bars.length; i++) {
    if (bars[i].high > high) high = bars[i].high;
    if (bars[i].low < low) low = bars[i].low;
  }
  return { high, low };
}

export function detectInsights(input: InsightInputs): Insight[] {
  const insights: Insight[] = [];
  const today = todaysRthBars(input.intraday1m);
  const stats = input.rthStats;
  const lv = input.sessionLevels;
  if (!today.length || !stats || !lv) {
    insights.push(regimeInsight(input.dailyBars));
    return insights;
  }

  const last = today[today.length - 1].close;
  const open = today[0].open;
  const range = stats.range;
  const trendDirection = range > 0 ? (last - open) / range : 0;

  // Trend day: above-average range AND directional close near extreme.
  if (range > stats.avgRange * 1.5 && Math.abs(trendDirection) > 0.6) {
    insights.push({
      id: "trend-day",
      label: trendDirection > 0 ? "Bull Trend Day" : "Bear Trend Day",
      description: `Range ${(range / stats.avgRange).toFixed(1)}× avg; closing ${Math.abs(trendDirection * 100).toFixed(0)}% toward ${trendDirection > 0 ? "highs" : "lows"}.`,
      tone: trendDirection > 0 ? "bull" : "bear",
      confidence: Math.min(1, Math.abs(trendDirection) * 1.2),
    });
  }

  // Range day: compressed range.
  if (range < stats.avgRange * 0.7 && today.length >= 60) {
    insights.push({
      id: "range-day",
      label: "Range Day",
      description: `Range ${((range / stats.avgRange) * 100).toFixed(0)}% of 20-day avg — fade extremes, avoid breakouts.`,
      tone: "info",
      confidence: Math.max(0.4, 1 - range / stats.avgRange),
    });
  }

  // Liquidity sweeps of PDH / PDL within the last 20 bars.
  const recent = today.slice(-20);
  const sweptUp = recent.some((b) => b.high > lv.prevDayHigh && b.close < lv.prevDayHigh);
  if (sweptUp && last < lv.prevDayHigh) {
    insights.push({
      id: "sweep-pdh",
      label: "PDH Liquidity Sweep",
      description: "Wicked above prior-day high then closed back below — stops likely taken.",
      tone: "warn",
      confidence: 0.7,
    });
  }
  const sweptDn = recent.some((b) => b.low < lv.prevDayLow && b.close > lv.prevDayLow);
  if (sweptDn && last > lv.prevDayLow) {
    insights.push({
      id: "sweep-pdl",
      label: "PDL Liquidity Sweep",
      description: "Wicked below prior-day low then closed back above — stops likely taken.",
      tone: "warn",
      confidence: 0.7,
    });
  }

  // Opening drive (first 60m: directional, > 0.35 ATR).
  const firstHour = today.slice(0, 60);
  if (firstHour.length >= 30) {
    const fh = highLow(firstHour)!;
    const fhRange = fh.high - fh.low;
    const drivePct = fhRange > 0 ? (firstHour[firstHour.length - 1].close - firstHour[0].open) / fhRange : 0;
    if (Math.abs(drivePct) > 0.7 && fhRange > stats.avgRange * 0.35) {
      insights.push({
        id: "opening-drive",
        label: drivePct > 0 ? "Bullish Opening Drive" : "Bearish Opening Drive",
        description: `Opening hour drove ${(Math.abs(drivePct) * 100).toFixed(0)}% in one direction.`,
        tone: drivePct > 0 ? "bull" : "bear",
        confidence: Math.abs(drivePct),
      });
    }
  }

  // Failed auction patterns.
  if (open > lv.prevDayHigh && last < lv.prevDayClose) {
    insights.push({
      id: "failed-auction-up",
      label: "Failed Auction (up)",
      description: "Opened above PDH but trading back below prior close — bearish rejection of higher prices.",
      tone: "bear",
      confidence: 0.8,
    });
  }
  if (open < lv.prevDayLow && last > lv.prevDayClose) {
    insights.push({
      id: "failed-auction-down",
      label: "Failed Auction (down)",
      description: "Opened below PDL but trading back above prior close — bullish rejection of lower prices.",
      tone: "bull",
      confidence: 0.8,
    });
  }

  // Inside / outside day vs prior settled day.
  if (stats.high < lv.prevDayHigh && stats.low > lv.prevDayLow) {
    insights.push({
      id: "inside-day",
      label: "Inside Day",
      description: "Today's range contained within prior-day range — breakout setup pending.",
      tone: "info",
      confidence: 0.9,
    });
  }
  if (stats.high > lv.prevDayHigh && stats.low < lv.prevDayLow) {
    insights.push({
      id: "outside-day",
      label: "Outside Day",
      description: "Today's range engulfed prior-day range — volatility expansion in play.",
      tone: "warn",
      confidence: 0.9,
    });
  }

  // Vol-correlated moves: short squeeze / long liquidation.
  if (input.vixChangePct < -3 && trendDirection > 0.5 && range > stats.avgRange * 1.2) {
    insights.push({
      id: "short-squeeze",
      label: "Potential Short Squeeze",
      description: "VIX collapsing while NQ runs higher — classic short-covering signature.",
      tone: "bull",
      confidence: 0.65,
    });
  }
  if (input.vixChangePct > 5 && trendDirection < -0.5 && range > stats.avgRange * 1.2) {
    insights.push({
      id: "long-liquidation",
      label: "Potential Long Liquidation",
      description: "VIX spiking while NQ falls hard — forced selling signature.",
      tone: "bear",
      confidence: 0.65,
    });
  }

  insights.push(regimeInsight(input.dailyBars));
  return insights;
}

function regimeInsight(dailyBars: Candle[]): Insight {
  const closes = dailyBars.map((d) => d.close);
  if (closes.length < 50) {
    return {
      id: "regime",
      label: "Regime: Insufficient History",
      description: "Need >= 50 daily bars to classify.",
      tone: "info",
      confidence: 0,
    };
  }
  const e20 = ema(closes, 20).at(-1);
  const e50 = ema(closes, 50).at(-1);
  if (e20 == null || e50 == null) {
    return {
      id: "regime",
      label: "Regime: Unknown",
      description: "—",
      tone: "info",
      confidence: 0,
    };
  }
  const spread = (e20 - e50) / e50;
  const trending = spread > 0.005 ? "up" : spread < -0.005 ? "down" : null;
  if (!trending) {
    return {
      id: "regime",
      label: "Regime: Ranging",
      description: `Daily EMA20/50 spread ${(spread * 100).toFixed(2)}% — no committed trend.`,
      tone: "info",
      confidence: Math.min(1, 1 - Math.abs(spread) * 50),
    };
  }
  return {
    id: "regime",
    label: `Regime: Trending ${trending === "up" ? "Up" : "Down"}`,
    description: `Daily EMA20 is ${trending === "up" ? "above" : "below"} EMA50 by ${(Math.abs(spread) * 100).toFixed(2)}%.`,
    tone: trending === "up" ? "bull" : "bear",
    confidence: Math.min(1, Math.abs(spread) * 50),
  };
}
