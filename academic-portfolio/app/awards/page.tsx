import { prisma } from "@/lib/db/client";
import { PageHeader } from "@/components/layout/PageHeader";
import { EmptyState } from "@/components/ui/EmptyState";
import { Trophy } from "lucide-react";

export default async function AwardsPage() {
  const items = await prisma.award.findMany({ orderBy: { date: "desc" } });

  const grouped = items.reduce<Record<string, typeof items>>((acc, a) => {
    acc[a.category] = acc[a.category] ?? [];
    acc[a.category].push(a);
    return acc;
  }, {});

  return (
    <div>
      <PageHeader title="Awards" description="Scholarships, honor societies, research grants, competition wins." />
      {items.length === 0 ? (
        <EmptyState icon={<Trophy className="h-8 w-8 opacity-40" />} title="No awards yet" addHref="/admin/award/new" />
      ) : (
        <div className="space-y-6">
          {Object.entries(grouped).map(([cat, list]) => (
            <section key={cat}>
              <h2 className="mb-2 text-base font-semibold">{cat}</h2>
              <div className="grid gap-3 sm:grid-cols-2">
                {list.map((a) => (
                  <article key={a.id} className="card p-4">
                    <div className="flex items-baseline justify-between gap-2">
                      <h3 className="text-sm font-medium">{a.title}</h3>
                      <span className="text-xs" style={{ color: "var(--text-soft)" }}>
                        {a.date}
                      </span>
                    </div>
                    <div className="mt-1 text-xs" style={{ color: "var(--text-soft)" }}>
                      {a.issuer}
                    </div>
                    <p className="mt-2 text-sm">{a.description}</p>
                  </article>
                ))}
              </div>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}
