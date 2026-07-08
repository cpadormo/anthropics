"use client";

import { useEffect, useState } from "react";

interface Props {
  target: number; // epoch ms
  className?: string;
  prefix?: string;
  showSeconds?: boolean;
}

function format(ms: number, showSeconds: boolean): string {
  const total = Math.max(0, Math.floor(ms / 1000));
  const days = Math.floor(total / 86400);
  const hours = Math.floor((total % 86400) / 3600);
  const minutes = Math.floor((total % 3600) / 60);
  const seconds = total % 60;
  const p = (n: number) => String(n).padStart(2, "0");
  if (days > 0) {
    return showSeconds
      ? `${days}d ${p(hours)}:${p(minutes)}:${p(seconds)}`
      : `${days}d ${p(hours)}:${p(minutes)}`;
  }
  return showSeconds
    ? `${p(hours)}:${p(minutes)}:${p(seconds)}`
    : `${p(hours)}:${p(minutes)}`;
}

export function Countdown({ target, className, prefix, showSeconds = true }: Props) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);
  return (
    <span className={className}>
      {prefix}
      <span className="font-mono tabular-nums">{format(target - now, showSeconds)}</span>
    </span>
  );
}
