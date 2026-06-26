import "./globals.css";
import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "NQ Desk — Trading Dashboard",
  description: "Professional discretionary trading cockpit for NQ / MNQ futures",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body className="app-shell font-sans text-text-primary">{children}</body>
    </html>
  );
}
