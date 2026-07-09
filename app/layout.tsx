import "./globals.css";
import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Sidebar } from "@/components/layout/Sidebar";
import { TopBar } from "@/components/layout/TopBar";
import { ThemeProvider } from "@/components/layout/ThemeProvider";
import { requireAdmin } from "@/lib/auth";

export const metadata: Metadata = {
  title: "Academic Portfolio",
  description: "Coursework, research, writing, internships, and growth — in one place.",
  robots: {
    index: false,
    follow: false,
    nocache: true,
    googleBot: {
      index: false,
      follow: false,
      noimageindex: true,
      "max-snippet": -1,
      "max-image-preview": "none",
      "max-video-preview": -1,
    },
  },
};

export default async function RootLayout({ children }: { children: ReactNode }) {
  const isAdmin = await requireAdmin();
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <ThemeProvider>
          <div className="flex min-h-screen">
            <Sidebar />
            <div className="flex flex-1 flex-col">
              <TopBar isAdmin={isAdmin} />
              <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-6 lg:px-8 lg:py-8">{children}</main>
              <footer
                className="border-t px-4 py-6 text-center text-xs lg:px-8"
                style={{ borderColor: "var(--border)", color: "var(--text-soft)" }}
              >
                Built for graduate-school readiness · Update through the Admin panel
              </footer>
            </div>
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}
