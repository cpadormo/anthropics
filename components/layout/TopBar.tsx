"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Menu, Moon, Search, Sun } from "lucide-react";
import { useState } from "react";
import { useTheme } from "./ThemeProvider";
import { ThemeSwitcher } from "./ThemeSwitcher";
import { navItems } from "@/lib/nav";

export function TopBar() {
  const { mode, toggle } = useTheme();
  const router = useRouter();
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);

  const onSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!q.trim()) return;
    router.push(`/search?q=${encodeURIComponent(q.trim())}`);
  };

  return (
    <header
      className="sticky top-0 z-30 border-b backdrop-blur"
      style={{ borderColor: "var(--border)", background: "color-mix(in oklab, var(--surface) 92%, transparent)" }}
    >
      <div className="flex items-center gap-3 px-4 py-3 lg:px-6">
        <button
          type="button"
          className="rounded-md p-2 lg:hidden"
          aria-label="Toggle menu"
          onClick={() => setOpen((s) => !s)}
        >
          <Menu className="h-5 w-5" />
        </button>

        <form onSubmit={onSearch} className="relative flex-1 max-w-xl">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2" style={{ color: "var(--text-soft)" }} />
          <input
            type="search"
            placeholder="Search coursework, papers, research…"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            className="input pl-9"
          />
        </form>

        <ThemeSwitcher />

        <button type="button" onClick={toggle} className="btn-ghost" aria-label="Toggle light/dark">
          {mode === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
        </button>
      </div>

      {open && (
        <div className="border-t lg:hidden" style={{ borderColor: "var(--border)" }}>
          <div className="grid grid-cols-2 gap-1 px-3 py-3 sm:grid-cols-3">
            {navItems.map((item) => (
              <Link key={item.href} href={item.href} className="nav-link" onClick={() => setOpen(false)}>
                <item.icon className="h-4 w-4" />
                <span>{item.label}</span>
              </Link>
            ))}
          </div>
        </div>
      )}
    </header>
  );
}
