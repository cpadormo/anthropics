import { prisma } from "@/lib/db/client";
import { PageHeader } from "@/components/layout/PageHeader";
import { EmptyState } from "@/components/ui/EmptyState";
import { Sparkle } from "lucide-react";
import { formatDateRange, splitLines } from "@/lib/utils";

export default async function ExtracurricularsPage() {
  const items = await prisma.volunteer.findMany({ orderBy: { createdAt: "desc" } });
  const total = items.reduce((acc, v) => acc + v.hours, 0);

  return (
    <div>
      <PageHeader
        title="Extracurriculars"
        description={total > 0 ? `${total} total hours across activities and community engagement.` : "Activities, clubs, and community engagement."}
      />
      {items.length === 0 ? (
        <EmptyState icon={<Sparkle className="h-8 w-8 opacity-40" />} title="No extracurriculars yet" addHref="/admin/extracurricular/new" />
      ) : (
        <div className="space-y-3">
          {items.map((v) => {
            const skills = splitLines(v.skills);
            const dateRange = formatDateRange(v.startDate, v.endDate);
            return (
              <article key={v.id} className="card p-5">
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <h2 className="text-base font-semibold">{v.organization}</h2>
                  <div className="text-xs" style={{ color: "var(--text-soft)" }}>
                    {dateRange}
                    {v.hours > 0 ? `${dateRange ? " · " : ""}${v.hours} hours` : ""}
                  </div>
                </div>
                <div className="mt-1 text-sm" style={{ color: "var(--text-soft)" }}>
                  {v.role}
                  {v.population ? ` · ${v.population}` : ""}
                </div>
                {skills.length > 0 && (
                  <ul className="mt-3 flex flex-wrap gap-1.5">
                    {skills.map((s) => (
                      <li key={s} className="badge">
                        {s}
                      </li>
                    ))}
                  </ul>
                )}
                {v.reflection && (
                  <p className="mt-3 text-sm italic" style={{ color: "var(--text-soft)" }}>
                    {v.reflection}
                  </p>
                )}
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}
