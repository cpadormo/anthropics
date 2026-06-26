export type AssetClass = "future" | "index" | "fx" | "rate" | "commodity" | "crypto";

export type Timeframe = "1m" | "5m" | "15m" | "1H" | "4H" | "D";

export const TIMEFRAME_SECONDS: Record<Timeframe, number> = {
  "1m": 60,
  "5m": 300,
  "15m": 900,
  "1H": 3600,
  "4H": 14400,
  "D": 86400,
};

export interface Instrument {
  symbol: string;
  display: string;
  name: string;
  assetClass: AssetClass;
  tickSize: number;
  tickValueUSD?: number;
  contractMultiplier?: number;
  priceDecimals: number;
  basePrice: number;
  annualVol: number;
}

export interface Quote {
  symbol: string;
  last: number;
  change: number;
  changePct: number;
  prevClose: number;
  ts: number;
  series: number[];
}

export interface Candle {
  ts: number; // bar open time (epoch ms)
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface SessionLevels {
  symbol: string;
  asiaHigh: number;
  asiaLow: number;
  londonHigh: number;
  londonLow: number;
  overnightHigh: number;
  overnightLow: number;
  prevDayHigh: number;
  prevDayLow: number;
  prevDayClose: number;
  prevWeekHigh: number;
  prevWeekLow: number;
  prevMonthHigh: number;
  prevMonthLow: number;
  gapPoints: number;
  gapPct: number;
}

export interface RthSessionStats {
  symbol: string;
  high: number;
  low: number;
  range: number;
  avgRange: number;
  rangeExpansionPct: number;
  ibHigh: number;
  ibLow: number;
  ibRange: number;
  openingPrint: number;
  momentumScore: number;
}
