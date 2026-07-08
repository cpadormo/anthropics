import type { Candle, RthSessionStats, SessionLevels } from "../types";

// Pure derivation helpers used by TradovateProvider once real bars are flowing.
// All session windows are defined in America/New_York; we convert each bar's UTC
// open-time into ET via Intl.DateTimeFormat to stay correct across DST.

interface EtParts {
  year: number;
  month: number;
  day: number;
  hour: number;
  minute: number;
}

function etParts(ts: number): EtParts {
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
  // Intl reports hour as "24" at midnight in some locales; normalize.
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

export function deriveSessionLevels(
  symbol: string,
  intradayBars: Candle[],
  dailyBars: Candle[],
): SessionLevels | null {
  if (intradayBars.length === 0 || dailyBars.length < 2) return null;

  // "Today" is wall-clock today in ET, not the last bar's date — so the
  // dashboard classifies sessions correctly even during a low-volume gap.
  const today = etDateKey(Date.now());

  const asia: Candle[] = [];
  const london: Candle[] = [];
  const overnight: Candle[] = [];
  for (const b of intradayBars) {
    const p = etParts(b.ts);
    const dayKey = `${p.year}-${String(p.month).padStart(2, "0")}-${String(p.day).padStart(2, "0")}`;
    const h = p.hour + p.minute / 60;
    const isPrev = dayKey < today;
    const isToday = dayKey === today;

    // Asia: prev-day 18:00 -> today 03:00 ET
    if ((isPrev && h >= 18) || (isToday && h < 3)) {
      asia.push(b);
      overnight.push(b);
      continue;
    }
    // London: today 03:00 -> 09:30 ET
    if (isToday && h >= 3 && h < 9.5) {
      london.push(b);
      overnight.push(b);
      continue;
    }
  }

  const asiaHL = highLow(asia);
  const londonHL = highLow(london);
  const overnightHL = highLow(overnight);

  const sortedDaily = [...dailyBars].sort((a, b) => a.ts - b.ts);
  // Last daily bar is today (in progress); previous is the prior settled session.
  const lastIdx = sortedDaily.length - 1;
  const todayDaily = sortedDaily[lastIdx];
  const prevDay = sortedDaily[lastIdx - 1];
  const prevWeekBars = sortedDaily.slice(Math.max(0, lastIdx - 5), lastIdx);
  const prevMonthBars = sortedDaily.slice(Math.max(0, lastIdx - 21), lastIdx);
  const prevWeekHL = highLow(prevWeekBars);
  const prevMonthHL = highLow(prevMonthBars);

  const prevDayClose = prevDay?.close ?? todayDaily?.open ?? 0;
  const last = todayDaily?.close ?? prevDayClose;
  const gapPoints = last - prevDayClose;

  return {
    symbol,
    asiaHigh: asiaHL?.high ?? prevDayClose,
    asiaLow: asiaHL?.low ?? prevDayClose,
    londonHigh: londonHL?.high ?? prevDayClose,
    londonLow: londonHL?.low ?? prevDayClose,
    overnightHigh: overnightHL?.high ?? prevDayClose,
    overnightLow: overnightHL?.low ?? prevDayClose,
    prevDayHigh: prevDay?.high ?? prevDayClose,
    prevDayLow: prevDay?.low ?? prevDayClose,
    prevDayClose,
    prevWeekHigh: prevWeekHL?.high ?? prevDayClose,
    prevWeekLow: prevWeekHL?.low ?? prevDayClose,
    prevMonthHigh: prevMonthHL?.high ?? prevDayClose,
    prevMonthLow: prevMonthHL?.low ?? prevDayClose,
    gapPoints,
    gapPct: prevDayClose ? (gapPoints / prevDayClose) * 100 : 0,
  };
}

export function deriveRthStats(
  symbol: string,
  intradayBars: Candle[],
  dailyBars: Candle[],
): RthSessionStats | null {
  if (intradayBars.length === 0) return null;
  const today = etDateKey(Date.now());

  const rth: Candle[] = [];
  const ib: Candle[] = [];
  for (const b of intradayBars) {
    const p = etParts(b.ts);
    const dayKey = `${p.year}-${String(p.month).padStart(2, "0")}-${String(p.day).padStart(2, "0")}`;
    if (dayKey !== today) continue;
    const h = p.hour + p.minute / 60;
    if (h >= 9.5 && h < 16) rth.push(b);
    if (h >= 9.5 && h < 10.5) ib.push(b);
  }
  if (!rth.length) return null;

  const rthHL = highLow(rth)!;
  const ibHL = highLow(ib) ?? rthHL;
  const openingPrint = rth[0].open;
  const last = rth[rth.length - 1].close;
  const range = rthHL.high - rthHL.low;

  // 20-day average true range from prior daily bars (excluding today).
  const sortedDaily = [...dailyBars].sort((a, b) => a.ts - b.ts);
  const past = sortedDaily.slice(Math.max(0, sortedDaily.length - 21), sortedDaily.length - 1);
  const avgRange = past.length
    ? past.reduce((acc, b) => acc + (b.high - b.low), 0) / past.length
    : range;

  return {
    symbol,
    high: rthHL.high,
    low: rthHL.low,
    range,
    avgRange,
    rangeExpansionPct: avgRange ? (range / avgRange - 1) * 100 : 0,
    ibHigh: ibHL.high,
    ibLow: ibHL.low,
    ibRange: ibHL.high - ibHL.low,
    openingPrint,
    momentumScore: range ? Math.tanh(((last - openingPrint) / range) * 2) : 0,
  };
}
