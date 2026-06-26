export type EventCategory =
  | "CPI"
  | "PPI"
  | "NFP"
  | "FOMC"
  | "POWELL"
  | "TREASURY"
  | "OPEX"
  | "OTHER";

export interface CalendarEvent {
  id: string;
  country: string;
  event: string;
  impact: "low" | "medium" | "high";
  time: number; // epoch ms
  estimate: number | null;
  actual: number | null;
  prev: number | null;
  unit: string;
  category: EventCategory;
}

export interface CalendarResponse {
  events: CalendarEvent[];
  demo: boolean;
  error?: string;
}

export function categorizeEvent(event: string): EventCategory {
  const e = event.toLowerCase();
  if (/\bcpi\b|consumer price/.test(e)) return "CPI";
  if (/\bppi\b|producer price/.test(e)) return "PPI";
  if (/non[\s-]?farm|\bnfp\b|payrolls/.test(e)) return "NFP";
  if (/fomc|fed rate|fed funds|interest rate decision|federal funds/.test(e)) return "FOMC";
  if (/powell|fed chair/.test(e)) return "POWELL";
  if (/treasury|t-?bond|t-?note|t-?bill|bond auction|note auction/.test(e)) return "TREASURY";
  if (/triple witching|opex|options expir/.test(e)) return "OPEX";
  return "OTHER";
}

export function demoCalendarEvents(): CalendarEvent[] {
  const now = Date.now();
  const h = 3600 * 1000;
  return [
    { id: "demo-1", country: "US", event: "Core CPI m/m", impact: "high", time: now + 2 * h, estimate: 0.3, actual: null, prev: 0.2, unit: "%", category: "CPI" },
    { id: "demo-2", country: "US", event: "Initial Jobless Claims", impact: "medium", time: now + 4 * h, estimate: 220, actual: null, prev: 232, unit: "K", category: "OTHER" },
    { id: "demo-3", country: "US", event: "10-Year Note Auction", impact: "medium", time: now + 6 * h, estimate: null, actual: null, prev: 4.42, unit: "%", category: "TREASURY" },
    { id: "demo-4", country: "US", event: "Crude Oil Inventories", impact: "medium", time: now + 8 * h, estimate: -2.1, actual: null, prev: 1.5, unit: "M", category: "OTHER" },
    { id: "demo-5", country: "US", event: "FOMC Member Powell Speech", impact: "high", time: now + 26 * h, estimate: null, actual: null, prev: null, unit: "", category: "POWELL" },
    { id: "demo-6", country: "US", event: "30-Year Bond Auction", impact: "low", time: now + 30 * h, estimate: null, actual: null, prev: 4.62, unit: "%", category: "TREASURY" },
    { id: "demo-7", country: "US", event: "Non-Farm Payrolls", impact: "high", time: now + 54 * h, estimate: 185, actual: null, prev: 227, unit: "K", category: "NFP" },
  ];
}
