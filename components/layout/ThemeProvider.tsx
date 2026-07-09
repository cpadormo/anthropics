"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { DEFAULT_THEME_ID, findTheme, themes, type Theme } from "@/lib/themes";

type Mode = "light" | "dark";

type ThemeContextValue = {
  mode: Mode;
  toggle: () => void;
  themeId: string;
  setThemeId: (id: string) => void;
  themes: Theme[];
  currentTheme: Theme;
};

const ThemeContext = createContext<ThemeContextValue>({
  mode: "light",
  toggle: () => {},
  themeId: DEFAULT_THEME_ID,
  setThemeId: () => {},
  themes,
  currentTheme: findTheme(DEFAULT_THEME_ID),
});

function applyTheme(themeId: string, mode: Mode) {
  const theme = findTheme(themeId);
  const c = mode === "dark" ? theme.dark : theme.light;
  const root = document.documentElement;
  root.style.setProperty("--bg", c.bg);
  root.style.setProperty("--surface", c.surface);
  root.style.setProperty("--border", c.border);
  root.style.setProperty("--text", c.text);
  root.style.setProperty("--text-soft", c.textSoft);
  root.style.setProperty("--accent", c.accent);
  root.style.setProperty("--accent-soft", c.accentSoft);
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [mode, setMode] = useState<Mode>("light");
  const [themeId, setThemeIdState] = useState<string>(DEFAULT_THEME_ID);

  useEffect(() => {
    const storedMode = (typeof window !== "undefined" && (localStorage.getItem("ap-theme") as Mode | null)) || null;
    const storedTheme =
      (typeof window !== "undefined" && localStorage.getItem("ap-theme-id")) || DEFAULT_THEME_ID;
    const prefersDark =
      typeof window !== "undefined" && window.matchMedia("(prefers-color-scheme: dark)").matches;
    const initialMode: Mode = storedMode ?? (prefersDark ? "dark" : "light");
    setMode(initialMode);
    setThemeIdState(storedTheme);
    document.documentElement.classList.toggle("dark", initialMode === "dark");
    applyTheme(storedTheme, initialMode);
  }, []);

  const toggle = () => {
    setMode((prev) => {
      const next = prev === "dark" ? "light" : "dark";
      document.documentElement.classList.toggle("dark", next === "dark");
      applyTheme(themeId, next);
      try {
        localStorage.setItem("ap-theme", next);
      } catch {}
      return next;
    });
  };

  const setThemeId = (id: string) => {
    setThemeIdState(id);
    applyTheme(id, mode);
    try {
      localStorage.setItem("ap-theme-id", id);
    } catch {}
  };

  return (
    <ThemeContext.Provider
      value={{ mode, toggle, themeId, setThemeId, themes, currentTheme: findTheme(themeId) }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
