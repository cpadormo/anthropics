"use client";

import { useEffect, useState } from "react";
import { getInternalsFeed, type Internals } from "../data/internals";

export function useInternals(): Internals | null {
  const [v, setV] = useState<Internals | null>(null);
  useEffect(() => getInternalsFeed().subscribe(setV), []);
  return v;
}
