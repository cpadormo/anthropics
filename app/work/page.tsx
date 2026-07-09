import { prisma } from "@/lib/db/client";
import { PageHeader } from "@/components/layout/PageHeader";
import { EmptyState } from "@/components/ui/EmptyState";
import { Briefcase } from "lucide-react";
import { dateStringToScore, formatDateRange, splitLines } from "@/lib/utils";

export default async function WorkExperiencePage() {
  const rows = await prisma.workExperience.findMany();
  const items = [...rows].sort((a, b) => {
    const scoreDiff = dateStringToScore(b.startDate) - dateStringToScore(a.startDate);
    if (scoreDiff !== 0) return scoreDiff;
    return b.createdAt.getTime() - a.createdAt.getTime();
  });

  return (
    <div>
      <PageHeader title="Other Work Experiences" description="Paid positions, part-time work, tutoring, and other employment. Most recent first." />
      {items.length === 0 ? (
        <EmptyState
          icon={<Briefcase className="h-8 w-8 opacity-40" />}
          title="No work experience yet"
          hint="Add a job, part-time role, or tutoring position."
          addHref="/admin/work/new"
        />
      ) : (
        <div className="space-y-4">
          {items.map((w) => {
            const responsibilities = splitLines(w.responsibilities);
            const skills = splitLines(w.skills);
            return (
              <article key={w.id} className="card p-6">
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <div>
                    <h2 className="text-lg font-semibold">{w.organization}</h2>
                    <div className="mt-1 text-sm" style={{ color: "var(--text-soft)" }}>
                      {w.role}
                      {w.location ? ` · ${w.location}` : ""}
                    </div>
                  </div>
                  <div className="text-right text-xs" style={{ color: "var(--text-soft)" }}>
                    <div>{formatDateRange(w.startDate, w.endDate)}</div>
                    <span className="badge mt-1">{w.employmentType}</span>
                  </div>
                </div>

                {responsibilities.length > 0 && (
                  <div className="mt-4">
                    <div className="label">Responsibilities</div>
                    <ul className="list-disc space-y-1 pl-5 text-sm">
                      {responsibilities.map((r) => (
                        <li key={r}>{r}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {skills.length > 0 && (
                  <div className="mt-4">
                    <div className="label">Skills gained</div>
                    <ul className="flex flex-wrap gap-1.5">
                      {skills.map((s) => (
                        <li key={s} className="badge">
                          {s}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {w.reflection && (
                  <div className="mt-4">
                    <div className="label">Reflection</div>
                    <p className="text-sm italic" style={{ color: "var(--text-soft)" }}>
                      {w.reflection}
                    </p>
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
