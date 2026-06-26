"use client";

import type { DataProvider } from "./provider";
import { MockDataProvider } from "./mock-feed";
import { TradovateProvider } from "./tradovate-provider";

// Single client-side singleton. The choice is captured at bundle time
// via NEXT_PUBLIC_DATA_PROVIDER so every hook sees the same provider.
let _provider: DataProvider | null = null;

export function getProvider(): DataProvider {
  if (_provider) return _provider;
  const choice = process.env.NEXT_PUBLIC_DATA_PROVIDER ?? "mock";
  switch (choice) {
    case "tradovate":
      _provider = new TradovateProvider();
      break;
    case "mock":
    default:
      _provider = new MockDataProvider();
      break;
  }
  return _provider;
}
