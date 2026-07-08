"use client";

import { useEffect, useState } from "react";
import type { ProviderStatus } from "../data/provider";
import { getProvider } from "../data/provider-factory";

export function useProviderStatus(): ProviderStatus {
  const [s, setS] = useState<ProviderStatus>(() => getProvider().status());
  useEffect(() => {
    const provider = getProvider();
    setS(provider.status());
    return provider.onStatusChange?.(setS);
  }, []);
  return s;
}
