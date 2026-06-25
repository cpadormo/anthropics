import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

export function fmtPrice(v: number, decimals = 2): string {
  return v.toLocaleString("en-US", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

export function fmtPct(v: number, decimals = 2): string {
  const sign = v >= 0 ? "+" : "";
  return `${sign}${v.toFixed(decimals)}%`;
}

export function fmtSigned(v: number, decimals = 2): string {
  const sign = v >= 0 ? "+" : "";
  return `${sign}${v.toFixed(decimals)}`;
}
