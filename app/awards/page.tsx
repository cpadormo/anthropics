import { prisma } from "@/lib/db/client";
import { PageHeader } from "@/components/layout/PageHeader";
import { EmptyState } from "@/components/ui/EmptyState";
import { Trophy } from "lucide-react";
import { dateStringToScore } from "@/lib/utils";

export default async function AwardsPage() {
  const rows = await prisma.award.findMany();
  const items = [...rows].sort((a, b) => dateStringToScore(b.date) - dateStringToScore(a.date));

  return (
    <div>
      <PageHeader title="Awards" description="Scholarships, honor societies, research grants, competition wins. Most recent first." />
      {items.length === 0 ? (
        <EmptyState icon={<Trophy className="h-8 w-8 opacity-40" />} title="No awards yet" addHref="/admin/award/new" />
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {items.map((a) => (
            <article key={a.id} className="card p-4">
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <h3 className="text-sm font-medium">{a.title}</h3>
                <span className="badge">{a.category}</span>
              </div>
              <div className="mt-1 text-xs" style={{ color: "var(--text-soft)" }}>
                {a.issuer} · {a.date}
              </div>
              <p className="mt-2 text-sm">{a.description}</p>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
