"use client";

import { useEffect, useState } from "react";
import type { NewsItem, NewsResponse } from "../data/news";

const POLL_MS = 2 * 60 * 1000;

export function useNews(): { items: NewsItem[]; demo: boolean } {
  const [data, setData] = useState<NewsResponse>({ items: [], demo: true });
  useEffect(() => {
    let active = true;
    const load = async () => {
      try {
        const res = await fetch("/api/finnhub/news", { cache: "no-store" });
        if (!res.ok) return;
        const json = (await res.json()) as NewsResponse;
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
  return { items: data.items, demo: data.demo };
}
