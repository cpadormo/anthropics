"use client";

import { useEffect, useState } from "react";
import { getInternalsFeed, type Internals } from "../data/internals";

interface InternalsState {
  internals: Internals | null;
  demo: boolean;
}

export function useInternals(): InternalsState {
  const [state, setState] = useState<InternalsState>({
    internals: null,
    demo: true,
  });

  useEffect(() => {
    let active = true;
    let timer: ReturnType<typeof setInterval> | null = null;
    let synthUnsub: (() => void) | null = null;

    async function loadServer(): Promise<boolean> {
      try {
        const res = await fetch("/api/internals", { cache: "no-store" });
        if (!res.ok) return false;
        const data = await res.json();
        if (!active) return false;
        if (data?.internals && !data.demo) {
          setState({ internals: data.internals as Internals, demo: false });
          return true;
        }
        return false;
      } catch {
        return false;
      }
    }

    void loadServer().then((ok) => {
      if (!active) return;
      if (ok) {
        timer = setInterval(loadServer, 1500);
      } else {
        // No bridge configured: subscribe to the synthetic feed.
        synthUnsub = getInternalsFeed().subscribe((i) =>
          setState({ internals: i, demo: true }),
        );
      }
    });

    return () => {
      active = false;
      if (timer) clearInterval(timer);
      if (synthUnsub) synthUnsub();
    };
  }, []);

  return state;
}
