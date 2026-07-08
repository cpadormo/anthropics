"use client";

import { useEffect, useRef, useState } from "react";
import { getProvider } from "../data/provider-factory";
import { loadAlerts, saveAlerts, type Alert } from "../data/alerts";
import { useDbMode, type DbMode } from "./use-db-mode";

interface AlertsApi {
  alerts: Alert[];
  add: (a: Alert) => void;
  update: (id: string, next: Alert) => void;
  remove: (id: string) => void;
  mode: DbMode;
}

function sorted(a: Alert[]): Alert[] {
  return [...a].sort((x, y) => {
    if (x.active !== y.active) return x.active ? -1 : 1;
    return y.createdAt - x.createdAt;
  });
}

async function fireChannels(alert: Alert, currentPrice: number) {
  // Browser channel runs client-side; the server route handles Discord + SMS.
  if (
    alert.channels.includes("browser") &&
    typeof Notification !== "undefined" &&
    Notification.permission === "granted"
  ) {
    try {
      new Notification(`${alert.symbol} ${alert.condition} ${alert.price}`, {
        body: `Last ${currentPrice.toFixed(2)}${alert.note ? ` · ${alert.note}` : ""}`,
        tag: alert.id,
      });
    } catch {
      /* ignore notification errors */
    }
  }
  if (
    alert.channels.includes("discord") ||
    alert.channels.includes("sms")
  ) {
    try {
      await fetch("/api/alerts/notify", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ alert, currentPrice }),
      });
    } catch {
      /* swallow — the alert is still marked triggered locally */
    }
  }
}

export function useAlerts(): AlertsApi {
  const mode = useDbMode();
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const alertsRef = useRef<Alert[]>([]);
  alertsRef.current = alerts;

  useEffect(() => {
    if (mode === "checking") return;
    let active = true;
    if (mode === "db") {
      fetch("/api/alerts", { cache: "no-store" })
        .then((r) => (r.ok ? r.json() : { alerts: [] }))
        .then((d) => {
          if (active) setAlerts(sorted(d?.alerts ?? []));
        })
        .catch(() => {
          if (active) setAlerts(sorted(loadAlerts()));
        });
    } else {
      setAlerts(sorted(loadAlerts()));
    }
    return () => {
      active = false;
    };
  }, [mode]);

  // Tick evaluator: subscribe to each symbol that has at least one
  // active, untriggered alert. Re-subscribes whenever the relevant
  // shape of `alerts` changes.
  const subKey = alerts
    .filter((a) => a.active && !a.triggered)
    .map((a) => `${a.symbol}|${a.condition}|${a.price}|${a.id}`)
    .join(";");
  useEffect(() => {
    if (mode === "checking") return;
    const provider = getProvider();
    const symbols = Array.from(
      new Set(
        alertsRef.current
          .filter((a) => a.active && !a.triggered)
          .map((a) => a.symbol),
      ),
    );
    if (!symbols.length) return;
    const unsubs = symbols.map((sym) =>
      provider.subscribe(sym, (q) => {
        const matches = alertsRef.current.filter(
          (a) =>
            a.active &&
            !a.triggered &&
            a.symbol === sym &&
            ((a.condition === "above" && q.last >= a.price) ||
              (a.condition === "below" && q.last <= a.price)),
        );
        for (const m of matches) {
          // Mark triggered first so we don't re-fire on subsequent ticks.
          const fired: Alert = { ...m, triggered: true, triggeredAt: Date.now() };
          internalUpdate(m.id, fired);
          void fireChannels(fired, q.last);
        }
      }),
    );
    return () => {
      for (const u of unsubs) u();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode, subKey]);

  function persist(next: Alert[]) {
    setAlerts(next);
    if (mode === "local") saveAlerts(next);
  }

  function internalUpdate(id: string, replacement: Alert) {
    const next = sorted(
      alertsRef.current.map((a) => (a.id === id ? replacement : a)),
    );
    persist(next);
    if (mode === "db") {
      void fetch(`/api/alerts/${id}`, {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(replacement),
      });
    }
  }

  function add(a: Alert) {
    const next = sorted([a, ...alerts]);
    persist(next);
    if (mode === "db") {
      void fetch("/api/alerts", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(a),
      });
    }
  }

  function update(id: string, replacement: Alert) {
    internalUpdate(id, replacement);
  }

  function remove(id: string) {
    const next = alerts.filter((a) => a.id !== id);
    persist(next);
    if (mode === "db") {
      void fetch(`/api/alerts/${id}`, { method: "DELETE" });
    }
  }

  return { alerts, add, update, remove, mode };
}
