import { prisma } from "@/lib/db/client";
import { PageHeader } from "@/components/layout/PageHeader";
import { EmptyState } from "@/components/ui/EmptyState";
import { Clock } from "lucide-react";

const YEAR_ORDER = ["Freshman", "Sophomore", "Junior", "Senior", "Graduate"];

export default async function TimelinePage() {
  const items = await prisma.timelineEvent.findMany();

  const grouped = items.reduce<Record<string, typeof items>>((acc, e) => {
    acc[e.year] = acc[e.year] ?? [];
    acc[e.year].push(e);
    return acc;
  }, {});

  const orderedYears = YEAR_ORDER.filter((y) => grouped[y]).concat(
    Object.keys(grouped).filter((y) => !YEAR_ORDER.includes(y)),
  );

  return (
    <div>
      <PageHeader title="Timeline" description="Growth made visible — research, internships, leadership, awards, courses, and volunteer events year by year." />

      {items.length === 0 ? (
        <EmptyState icon={<Clock className="h-8 w-8 opacity-40" />} title="No timeline events yet" addHref="/admin/timeline/new" />
      ) : (
        <div className="space-y-10">
          {orderedYears.map((year) => (
            <section key={year}>
              <div className="mb-4 flex items-center gap-3">
                <h2 className="text-lg font-semibold">{year} Year</h2>
                <div className="h-px flex-1" style={{ background: "var(--border)" }} />
              </div>
              <ol className="relative space-y-4 border-l-2 pl-6" style={{ borderColor: "var(--accent-soft)" }}>
                {grouped[year].map((e) => (
                  <li key={e.id} className="relative">
                    <span
                      className="absolute -left-[31px] mt-1 grid h-4 w-4 place-items-center rounded-full"
                      style={{ background: "var(--accent)" }}
                    >
                      <span className="h-1.5 w-1.5 rounded-full bg-white" />
                    </span>
                    <div className="card p-4">
                      <div className="flex flex-wrap items-baseline justify-between gap-2">
                        <h3 className="text-sm font-semibold">{e.title}</h3>
                        <div className="flex items-center gap-2 text-xs" style={{ color: "var(--text-soft)" }}>
                          <span className="badge">{e.type}</span>
                          <span>{e.date}</span>
                        </div>
                      </div>
                      <p className="mt-1 text-sm">{e.description}</p>
                    </div>
                  </li>
                ))}
              </ol>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}
