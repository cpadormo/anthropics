import { nanoid } from "nanoid";

export type AlertCondition = "above" | "below";
export type AlertChannel = "browser" | "discord" | "sms";

export interface Alert {
  id: string;
  symbol: string;
  condition: AlertCondition;
  price: number;
  active: boolean;
  triggered: boolean;
  triggeredAt: number | null;
  channels: AlertChannel[];
  note: string;
  createdAt: number;
}

const KEY = "nqdesk.alerts.v1";

export function loadAlerts(): Alert[] {
  if (typeof localStorage === "undefined") return [];
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as Alert[]) : [];
  } catch {
    return [];
  }
}

export function saveAlerts(alerts: Alert[]): void {
  if (typeof localStorage === "undefined") return;
  try {
    localStorage.setItem(KEY, JSON.stringify(alerts));
  } catch {
    /* best-effort */
  }
}

export function newAlert(
  partial: Partial<Alert> & {
    symbol: string;
    condition: AlertCondition;
    price: number;
  },
): Alert {
  return {
    id: nanoid(),
    symbol: partial.symbol,
    condition: partial.condition,
    price: partial.price,
    active: partial.active ?? true,
    triggered: false,
    triggeredAt: null,
    channels: partial.channels ?? ["browser"],
    note: partial.note ?? "",
    createdAt: Date.now(),
  };
}
