import { prisma } from "@/lib/db/client";
import { PageHeader } from "@/components/layout/PageHeader";
import { EmptyState } from "@/components/ui/EmptyState";
import { Users2 } from "lucide-react";
import { formatDateRange, splitLines } from "@/lib/utils";

export default async function LeadershipPage() {
  const items = await prisma.leadership.findMany({ orderBy: { createdAt: "desc" } });

  return (
    <div>
      <PageHeader title="Leadership" description="Organizations, executive board positions, clubs, and projects led." />
      {items.length === 0 ? (
        <EmptyState icon={<Users2 className="h-8 w-8 opacity-40" />} title="No leadership roles yet" addHref="/admin/leadership/new" />
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {items.map((l) => {
            const accomplishments = splitLines(l.accomplishments);
            const projects = splitLines(l.projectsLed);
            return (
              <article key={l.id} className="card p-5">
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <h2 className="text-base font-semibold">{l.organization}</h2>
                  <div className="text-xs" style={{ color: "var(--text-soft)" }}>
                    {formatDateRange(l.startDate, l.endDate)}
                  </div>
                </div>
                <div className="mt-1 text-sm" style={{ color: "var(--text-soft)" }}>
                  {l.position}
                </div>
                {accomplishments.length > 0 && (
                  <>
                    <div className="label mt-3">Accomplishments</div>
                    <ul className="list-disc space-y-1 pl-5 text-sm">
                      {accomplishments.map((a) => (
                        <li key={a}>{a}</li>
                      ))}
                    </ul>
                  </>
                )}
                {projects.length > 0 && (
                  <>
                    <div className="label mt-3">Projects led</div>
                    <ul className="list-disc space-y-1 pl-5 text-sm">
                      {projects.map((p) => (
                        <li key={p}>{p}</li>
                      ))}
                    </ul>
                  </>
                )}
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}
