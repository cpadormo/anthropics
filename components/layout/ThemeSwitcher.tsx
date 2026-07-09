"use client";

import { useEffect, useRef, useState } from "react";
import { Palette } from "lucide-react";
import { useTheme } from "./ThemeProvider";

export function ThemeSwitcher() {
  const { themes, themeId, setThemeId, currentTheme } = useTheme();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((s) => !s)}
        className="btn-ghost"
        aria-label="Change theme"
        title={`Theme: ${currentTheme.name}`}
      >
        <span className="text-base leading-none">{currentTheme.emoji}</span>
        <Palette className="h-4 w-4" />
      </button>

      {open && (
        <div
          className="absolute right-0 top-full z-40 mt-2 w-56 overflow-hidden rounded-xl border shadow-card"
          style={{ background: "var(--surface)", borderColor: "var(--border)" }}
        >
          <div className="px-3 py-2 text-[10px] font-semibold uppercase tracking-wider" style={{ color: "var(--text-soft)" }}>
            Theme
          </div>
          <ul className="max-h-80 overflow-y-auto pb-1">
            {themes.map((t) => {
              const active = t.id === themeId;
              return (
                <li key={t.id}>
                  <button
                    type="button"
                    className="flex w-full items-center gap-3 px-3 py-2 text-left text-sm transition-colors"
                    style={{
                      background: active ? "var(--accent-soft)" : "transparent",
                      color: "var(--text)",
                    }}
                    onClick={() => {
                      setThemeId(t.id);
                      setOpen(false);
                    }}
                  >
                    <span
                      className="grid h-6 w-6 place-items-center rounded-full text-base"
                      style={{ background: t.light.accentSoft }}
                    >
                      {t.emoji}
                    </span>
                    <span className="flex-1 font-medium">{t.name}</span>
                    <span className="flex gap-0.5">
                      <span
                        className="h-3 w-3 rounded-full border"
                        style={{ background: t.light.accent, borderColor: t.light.border }}
                      />
                      <span
                        className="h-3 w-3 rounded-full border"
                        style={{ background: t.dark.accent, borderColor: t.dark.border }}
                      />
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
}
