import type { Instrument } from "./types";

// Reference prices and annualized vols are illustrative defaults
// for the V1 mock feed. Replaced by live data in V2.
export const INSTRUMENTS: Record<string, Instrument> = {
  NQ:    { symbol: "NQ",    display: "NQ",    name: "E-mini Nasdaq-100",     assetClass: "future",    tickSize: 0.25,  tickValueUSD: 5,    contractMultiplier: 20,   priceDecimals: 2, basePrice: 21450,  annualVol: 0.22 },
  ES:    { symbol: "ES",    display: "ES",    name: "E-mini S&P 500",        assetClass: "future",    tickSize: 0.25,  tickValueUSD: 12.5, contractMultiplier: 50,   priceDecimals: 2, basePrice: 5980,   annualVol: 0.16 },
  RTY:   { symbol: "RTY",   display: "RTY",   name: "E-mini Russell 2000",   assetClass: "future",    tickSize: 0.10,  tickValueUSD: 5,    contractMultiplier: 50,   priceDecimals: 2, basePrice: 2380,   annualVol: 0.24 },
  YM:    { symbol: "YM",    display: "YM",    name: "E-mini Dow",            assetClass: "future",    tickSize: 1,     tickValueUSD: 5,    contractMultiplier: 5,    priceDecimals: 0, basePrice: 44120,  annualVol: 0.14 },
  VIX:   { symbol: "VIX",   display: "VIX",   name: "CBOE Volatility Index", assetClass: "index",     tickSize: 0.01,                                          priceDecimals: 2, basePrice: 15.4,   annualVol: 0.85 },
  DXY:   { symbol: "DXY",   display: "DXY",   name: "US Dollar Index",       assetClass: "fx",        tickSize: 0.01,                                          priceDecimals: 2, basePrice: 106.2,  annualVol: 0.08 },
  US10Y: { symbol: "US10Y", display: "US10Y", name: "10Y Treasury Yield",    assetClass: "rate",      tickSize: 0.001,                                         priceDecimals: 3, basePrice: 4.38,   annualVol: 0.18 },
  GC:    { symbol: "GC",    display: "GC",    name: "Gold Futures",          assetClass: "commodity", tickSize: 0.1,   tickValueUSD: 10,   contractMultiplier: 100,  priceDecimals: 1, basePrice: 2680,   annualVol: 0.15 },
  CL:    { symbol: "CL",    display: "CL",    name: "Crude Oil",             assetClass: "commodity", tickSize: 0.01,  tickValueUSD: 10,   contractMultiplier: 1000, priceDecimals: 2, basePrice: 71.2,   annualVol: 0.30 },
  BTC:   { symbol: "BTC",   display: "BTC",   name: "Bitcoin",               assetClass: "crypto",    tickSize: 1,                                             priceDecimals: 0, basePrice: 95800,  annualVol: 0.65 },
  ETH:   { symbol: "ETH",   display: "ETH",   name: "Ethereum",              assetClass: "crypto",    tickSize: 0.5,                                           priceDecimals: 1, basePrice: 3340,   annualVol: 0.75 },
};

export const OVERVIEW_SYMBOLS = [
  "NQ", "ES", "RTY", "YM", "VIX", "DXY", "US10Y", "GC", "CL", "BTC", "ETH",
];
