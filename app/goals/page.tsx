import { prisma } from "@/lib/db/client";
import { PageHeader } from "@/components/layout/PageHeader";
import { EmptyState } from "@/components/ui/EmptyState";
import { Target } from "lucide-react";

const INTERESTS = [
  "Forensic Psychology",
  "Eyewitness Testimony",
  "Criminal Behavior",
  "Neuropsychology",
  "Juvenile Justice",
  "Psychopathy",
];

export default async function GoalsPage() {
  const items = await prisma.goal.findMany({ orderBy: { createdAt: "desc" } });
  const grouped = items.reduce<Record<string, typeof items>>((acc, g) => {
    acc[g.category] = acc[g.category] ?? [];
    acc[g.category].push(g);
    return acc;
  }, {});

  return (
    <div>
      <PageHeader title="Goals & Research Interests" description="Where I am, where I'm going, and what I want to study." />

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="card p-5 lg:col-span-2">
          <h2 className="mb-3 text-base font-semibold">Goals</h2>
          {items.length === 0 ? (
            <EmptyState icon={<Target className="h-8 w-8 opacity-40" />} title="No goals tracked yet" addHref="/admin/goal/new" />
          ) : (
            <div className="space-y-5">
              {Object.entries(grouped).map(([cat, list]) => (
                <div key={cat}>
                  <div className="label">{cat}</div>
                  <ul className="space-y-2">
                    {list.map((g) => (
                      <li key={g.id} className="flex items-start justify-between gap-3 text-sm">
                        <div>
                          <div className="font-medium">{g.title}</div>
                          <div style={{ color: "var(--text-soft)" }}>{g.description}</div>
                        </div>
                        <span className="badge">{g.status}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="card p-5">
          <h2 className="mb-3 text-base font-semibold">Research interests</h2>
          <ul className="flex flex-wrap gap-1.5">
            {INTERESTS.map((i) => (
              <li key={i} className="badge">
                {i}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
