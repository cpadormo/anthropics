"use client";

import { useEffect, useState } from "react";
import { Activity, Circle } from "lucide-react";

// Coarse session detection in UTC. ET conversion is handled separately
// for display. V2 will switch to exchange calendars (CME futures holidays
// and the 23:00–22:00 ET futures session boundary).
function getSession(now: Date) {
  const h = now.getUTCHours() + now.getUTCMinutes() / 60;
  if (h >= 14.5 && h < 21) return { name: "NY RTH", tone: "text-bull", open: true };
  if (h >= 7 && h < 15.5) return { name: "London", tone: "text-info", open: true };
  if (h >= 23 || h < 8) return { name: "Asia", tone: "text-accent", open: true };
  return { name: "Pre / Post", tone: "text-text-secondary", open: false };
}

export function TopBar() {
  const [now, setNow] = useState<Date | null>(null);
  useEffect(() => {
    setNow(new Date());
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  if (!now) return <div className="h-14 border-b border-white/5" />;

  const session = getSession(now);
  const utc = now.toISOString().slice(11, 19);
  const et = now.toLocaleTimeString("en-US", {
    hour12: false,
    timeZone: "America/New_York",
  });

  return (
    <header className="sticky top-0 z-30 border-b border-white/5 bg-bg-base/70 backdrop-blur-xl">
      <div className="flex items-center justify-between gap-4 px-4 h-14">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-accent to-info grid place-items-center shadow-glow">
            <Activity size={14} className="text-white" />
          </div>
          <div className="leading-tight">
            <div className="text-sm font-semibold tracking-tight text-text-primary">NQ Desk</div>
            <div className="text-2xs uppercase tracking-[0.14em] text-text-muted">
              Discretionary Cockpit
            </div>
          </div>
        </div>

        <div className="flex items-center gap-5 text-xs">
          <div className="flex items-center gap-1.5">
            <Circle
              size={8}
              className={session.open ? "fill-bull text-bull animate-pulseSoft" : "text-text-muted"}
            />
            <span className="text-text-secondary">Session</span>
            <span className={session.tone + " font-medium"}>{session.name}</span>
          </div>
          <div className="flex items-center gap-2 font-mono tabular-nums">
            <span className="text-text-muted">ET</span>
            <span className="text-text-primary">{et}</span>
          </div>
          <div className="flex items-center gap-2 font-mono tabular-nums">
            <span className="text-text-muted">UTC</span>
            <span className="text-text-secondary">{utc}</span>
          </div>
        </div>
      </div>
    </header>
  );
}
