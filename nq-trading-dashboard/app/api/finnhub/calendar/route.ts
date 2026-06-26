import { NextResponse } from "next/server";
import {
  type CalendarEvent,
  categorizeEvent,
  demoCalendarEvents,
} from "@/lib/data/calendar";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const FINNHUB_REVALIDATE_SECONDS = 600;

export async function GET() {
  const token = process.env.FINNHUB_API_KEY;
  if (!token) {
    return NextResponse.json({ events: demoCalendarEvents(), demo: true });
  }

  const from = new Date().toISOString().slice(0, 10);
  const to = new Date(Date.now() + 3 * 86400 * 1000).toISOString().slice(0, 10);

  try {
    const res = await fetch(
      `https://finnhub.io/api/v1/calendar/economic?from=${from}&to=${to}&token=${token}`,
      { next: { revalidate: FINNHUB_REVALIDATE_SECONDS } },
    );
    if (!res.ok) {
      return NextResponse.json({
        events: demoCalendarEvents(),
        demo: true,
        error: `Finnhub ${res.status}`,
      });
    }
    const data = await res.json();
    const raw = (data?.economicCalendar ?? []) as any[];
    const events: CalendarEvent[] = raw
      .filter(
        (e) => e.country === "US" && (e.impact === "high" || e.impact === "medium"),
      )
      .map((e, i): CalendarEvent => {
        const ts =
          typeof e.time === "string" ? Date.parse(e.time) : Number(e.time) * 1000;
        return {
          id: `${e.event}-${ts}-${i}`,
          country: String(e.country ?? ""),
          event: String(e.event ?? ""),
          impact: (e.impact as CalendarEvent["impact"]) ?? "low",
          time: ts,
          estimate: e.estimate != null ? Number(e.estimate) : null,
          actual: e.actual != null ? Number(e.actual) : null,
          prev: e.prev != null ? Number(e.prev) : null,
          unit: String(e.unit ?? ""),
          category: categorizeEvent(String(e.event ?? "")),
        };
      })
      .sort((a, b) => a.time - b.time);
    return NextResponse.json({ events, demo: false });
  } catch (err) {
    return NextResponse.json({
      events: demoCalendarEvents(),
      demo: true,
      error: (err as Error).message,
    });
  }
}
