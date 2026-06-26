"use client";

import { useEffect, useState } from "react";
import type { CalendarEvent, CalendarResponse } from "../data/calendar";

const POLL_MS = 5 * 60 * 1000;

export function useCalendar(): { events: CalendarEvent[]; demo: boolean } {
  const [data, setData] = useState<CalendarResponse>({ events: [], demo: true });
  useEffect(() => {
    let active = true;
    const load = async () => {
      try {
        const res = await fetch("/api/finnhub/calendar", { cache: "no-store" });
        if (!res.ok) return;
        const json = (await res.json()) as CalendarResponse;
        if (active) setData(json);
      } catch {
        /* keep previous state on transient failure */
      }
    };
    load();
    const id = setInterval(load, POLL_MS);
    return () => {
      active = false;
      clearInterval(id);
    };
  }, []);
  return { events: data.events, demo: data.demo };
}
