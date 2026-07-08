import { prisma } from "@/lib/db/client";
import { PageHeader } from "@/components/layout/PageHeader";
import { EmptyState } from "@/components/ui/EmptyState";
import { Briefcase } from "lucide-react";
import { formatDateRange, parseJsonArray, splitLines } from "@/lib/utils";

export default async function InternshipsPage() {
  const items = await prisma.internship.findMany({ orderBy: { createdAt: "desc" } });

  return (
    <div>
      <PageHeader title="Internship Experience" description="Each internship has its own profile: responsibilities, cases observed, skills, hours, and a reflection." />
      {items.length === 0 ? (
        <EmptyState icon={<Briefcase className="h-8 w-8 opacity-40" />} title="No internships yet" addHref="/admin/internship/new" />
      ) : (
        <div className="space-y-4">
          {items.map((i) => {
            const responsibilities = splitLines(i.responsibilities);
            const skills = splitLines(i.skills);
            const photos = parseJsonArray(i.photos);
            return (
              <article key={i.id} className="card p-6">
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <h2 className="text-lg font-semibold">{i.organization}</h2>
                  <div className="text-xs" style={{ color: "var(--text-soft)" }}>
                    {formatDateRange(i.startDate, i.endDate)} · {i.hours} hours
                  </div>
                </div>
                <div className="mt-1 text-sm" style={{ color: "var(--text-soft)" }}>
                  {i.role} · Supervisor: {i.supervisor}
                </div>

                <div className="mt-4 grid gap-4 sm:grid-cols-2">
                  <div>
                    <div className="label">Responsibilities</div>
                    <ul className="list-disc space-y-1 pl-5 text-sm">
                      {responsibilities.map((r) => (
                        <li key={r}>{r}</li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <div className="label">Cases observed</div>
                    <p className="text-sm">{i.cases}</p>
                    <div className="label mt-4">Skills</div>
                    <ul className="flex flex-wrap gap-1.5">
                      {skills.map((s) => (
                        <li key={s} className="badge">
                          {s}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="mt-4">
                  <div className="label">Reflection</div>
                  <p className="text-sm italic" style={{ color: "var(--text-soft)" }}>
                    {i.reflection}
                  </p>
                </div>

                {(i.recLetterUrl || photos.length > 0) && (
                  <div className="mt-4 flex flex-wrap items-center gap-3 text-sm">
                    {i.recLetterUrl && (
                      <a className="hover:underline" href={i.recLetterUrl} target="_blank" rel="noreferrer">
                        Recommendation letter
                      </a>
                    )}
                    {photos.map((url) => (
                      <a key={url} className="hover:underline" href={url} target="_blank" rel="noreferrer">
                        photo
                      </a>
                    ))}
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
