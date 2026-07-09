"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { groupedNav } from "@/lib/nav";

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden w-64 shrink-0 border-r p-4 lg:block" style={{ borderColor: "var(--border)" }}>
      <Link href="/" className="mb-6 flex items-center gap-2 px-2">
        <div
          className="grid h-8 w-8 place-items-center rounded-md text-sm font-bold text-white"
          style={{ background: "var(--accent)" }}
        >
          AP
        </div>
        <div className="text-sm">
          <div className="font-semibold leading-tight">Academic Portfolio</div>
          <div className="text-xs" style={{ color: "var(--text-soft)" }}>
            Personal · Private
          </div>
        </div>
      </Link>

      <nav className="space-y-5">
        {Object.entries(groupedNav).map(([section, items]) => (
          <div key={section}>
            <div
              className="mb-1.5 px-3 text-[10px] font-semibold uppercase tracking-wider"
              style={{ color: "var(--text-soft)" }}
            >
              {section}
            </div>
            <div className="space-y-0.5">
              {items.map((item) => {
                const Icon = item.icon;
                const active = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));
                return (
                  <Link key={item.href} href={item.href} className="nav-link" data-active={active}>
                    <Icon className="h-4 w-4" />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>
    </aside>
  );
}
