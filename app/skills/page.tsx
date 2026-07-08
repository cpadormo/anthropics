import { prisma } from "@/lib/db/client";
import { PageHeader } from "@/components/layout/PageHeader";
import { EmptyState } from "@/components/ui/EmptyState";
import { Sparkles } from "lucide-react";

export default async function SkillsPage() {
  const items = await prisma.skill.findMany({ orderBy: { name: "asc" } });
  const grouped = items.reduce<Record<string, typeof items>>((acc, s) => {
    acc[s.category] = acc[s.category] ?? [];
    acc[s.category].push(s);
    return acc;
  }, {});

  return (
    <div>
      <PageHeader title="Skills" description="Categorized by Research, Writing, Technology, Communication." />

      {items.length === 0 ? (
        <EmptyState icon={<Sparkles className="h-8 w-8 opacity-40" />} title="No skills yet" addHref="/admin/skill/new" />
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {Object.entries(grouped).map(([cat, list]) => (
            <section key={cat} className="card p-5">
              <h2 className="mb-3 text-base font-semibold">{cat}</h2>
              <ul className="space-y-2">
                {list.map((s) => (
                  <li key={s.id} className="flex items-baseline justify-between gap-3 text-sm">
                    <span>{s.name}</span>
                    <span className="badge">{s.level}</span>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}
