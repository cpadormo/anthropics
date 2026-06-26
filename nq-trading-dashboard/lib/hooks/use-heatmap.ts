"use client";

import { useEffect, useState } from "react";
import { syntheticHeatmap, type HeatmapGroup } from "../data/heatmap";

interface HeatmapState {
  groups: HeatmapGroup[];
  demo: boolean;
}

export function useHeatmap(): HeatmapState {
  const [state, setState] = useState<HeatmapState>(() => ({
    groups: syntheticHeatmap(),
    demo: true,
  }));

  useEffect(() => {
    let active = true;
    async function load() {
      try {
        const res = await fetch("/api/heatmap", { cache: "no-store" });
        if (!res.ok) return;
        const data = await res.json();
        if (!active) return;
        if (Array.isArray(data?.groups) && data.groups.length) {
          setState({ groups: data.groups, demo: !!data.demo });
        }
      } catch {
        /* keep previous state */
      }
    }
    load();
    // Real Polygon data: refresh on a 60s cadence to catch session moves.
    // Synthetic: same cadence keeps the 60s bucket from feeling stale.
    const id = setInterval(load, 60_000);
    // The synthetic generator also has a separate 60s tick when no API,
    // but the fetch above is the single source of truth either way.
    return () => {
      active = false;
      clearInterval(id);
    };
  }, []);

  return state;
}
