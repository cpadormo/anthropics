import { prisma } from "@/lib/db/client";
import { PageHeader } from "@/components/layout/PageHeader";
import { EmptyState } from "@/components/ui/EmptyState";
import { Presentation } from "lucide-react";
import { parseJsonArray, splitLines } from "@/lib/utils";

export default async function ConferencesPage() {
  const items = await prisma.conference.findMany({ orderBy: { date: "desc" } });

  return (
    <div>
      <PageHeader title="Conferences" description="Conferences attended, posters presented, and research shared." />
      {items.length === 0 ? (
        <EmptyState icon={<Presentation className="h-8 w-8 opacity-40" />} title="No conferences yet" addHref="/admin/conference/new" />
      ) : (
        <div className="space-y-3">
          {items.map((c) => {
            const topics = splitLines(c.topics);
            const photos = parseJsonArray(c.photos);
            return (
              <article key={c.id} className="card p-5">
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <h2 className="text-base font-semibold">{c.name}</h2>
                  <span className="badge">{c.role}</span>
                </div>
                <div className="mt-1 text-xs" style={{ color: "var(--text-soft)" }}>
                  {c.location} · {c.date}
                </div>

                {c.posterTitle && (
                  <p className="mt-3 text-sm">
                    <span className="font-medium">Poster:</span> {c.posterTitle}
                  </p>
                )}
                {c.presentationTitle && (
                  <p className="mt-1 text-sm">
                    <span className="font-medium">Talk:</span> {c.presentationTitle}
                  </p>
                )}

                {topics.length > 0 && (
                  <ul className="mt-3 flex flex-wrap gap-1.5">
                    {topics.map((t) => (
                      <li key={t} className="badge">
                        {t}
                      </li>
                    ))}
                  </ul>
                )}

                {photos.length > 0 && (
                  <div className="mt-3 text-xs" style={{ color: "var(--text-soft)" }}>
                    {photos.length} photo{photos.length === 1 ? "" : "s"} attached
                  </div>
                )}
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}
