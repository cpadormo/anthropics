export type AssetClass = "future" | "index" | "fx" | "rate" | "commodity" | "crypto";

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
