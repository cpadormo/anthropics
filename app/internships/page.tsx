import { prisma } from "@/lib/db/client";
import { PageHeader } from "@/components/layout/PageHeader";
import { EmptyState } from "@/components/ui/EmptyState";
import { Briefcase, ExternalLink } from "lucide-react";
import { dateStringToScore } from "@/lib/utils";

export default async function InternshipsPage() {
  const rows = await prisma.internship.findMany();
  const items = [...rows].sort((a, b) => {
    const scoreDiff = dateStringToScore(b.startDate) - dateStringToScore(a.startDate);
    if (scoreDiff !== 0) return scoreDiff;
    return b.createdAt.getTime() - a.createdAt.getTime();
  });

  return (
    <div>
      <PageHeader
        title="Internships / Professional Work"
        description="Internships and career-relevant professional roles with supervisor, hours, and reflection. Most recent first."
      />
      {items.length === 0 ? (
        <EmptyState icon={<Briefcase className="h-8 w-8 opacity-40" />} title="No entries yet" addHref="/admin/internship/new" />
      ) : (
        <div className="space-y-4">
          {items.map((i) => (
            <article key={i.id} className="card p-6">
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <div className="flex items-baseline gap-2">
                  <h2 className="text-lg font-semibold">{i.organization}</h2>
                  <span className="badge">{i.type || "Internship"}</span>
                </div>
                <div className="text-right text-xs" style={{ color: "var(--text-soft)" }}>
                  {i.startDate && <div>{i.startDate}</div>}
                  {i.hours > 0 && <div>{i.hours} hours</div>}
                </div>
              </div>
              <div className="mt-1 text-sm" style={{ color: "var(--text-soft)" }}>
                Supervisor: {i.supervisor}
              </div>

              {i.reflection && (
                <div className="mt-4">
                  <div className="label">Reflection</div>
                  <p className="text-sm italic" style={{ color: "var(--text-soft)" }}>
                    {i.reflection}
                  </p>
                </div>
              )}

              {i.scheduleUrl && (
                <a
                  href={i.scheduleUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="btn-ghost mt-4"
                >
                  <ExternalLink className="h-4 w-4" /> View schedule / attachment
                </a>
              )}
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
