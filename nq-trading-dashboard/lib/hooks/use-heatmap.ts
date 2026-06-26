"use client";

import { useEffect, useState } from "react";
import { syntheticHeatmap, type HeatmapGroup } from "../data/heatmap";

export function useHeatmap(): HeatmapGroup[] {
  const [groups, setGroups] = useState<HeatmapGroup[]>(() => syntheticHeatmap());
  useEffect(() => {
    const id = setInterval(() => setGroups(syntheticHeatmap()), 60_000);
    return () => clearInterval(id);
  }, []);
  return groups;
}
