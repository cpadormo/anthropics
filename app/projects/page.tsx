import { prisma } from "@/lib/db/client";
import { PageHeader } from "@/components/layout/PageHeader";
import { EmptyState } from "@/components/ui/EmptyState";
import { FolderKanban } from "lucide-react";
import { parseJsonArray, splitLines } from "@/lib/utils";

export default async function ProjectsPage() {
  const projects = await prisma.project.findMany({ orderBy: { createdAt: "desc" } });

  return (
    <div>
      <PageHeader title="Projects" description="Significant projects from coursework, research, and self-directed work." />

      {projects.length === 0 ? (
        <EmptyState
          icon={<FolderKanban className="h-8 w-8 opacity-40" />}
          title="No projects yet"
          hint="Add a project with goal, method, outcome, and files."
          addHref="/admin/project/new"
        />
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {projects.map((p) => {
            const skills = splitLines(p.skills);
            const files = parseJsonArray(p.files);
            return (
              <article key={p.id} className="card p-6">
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <h2 className="text-base font-semibold">{p.title}</h2>
                  <span className="text-xs" style={{ color: "var(--text-soft)" }}>
                    {p.date}
                  </span>
                </div>
                {p.course && (
                  <div className="mt-1 text-xs" style={{ color: "var(--text-soft)" }}>
                    {p.course}
                  </div>
                )}
                <p className="mt-3 text-sm">{p.summary}</p>

                <dl className="mt-4 grid gap-2 text-sm sm:grid-cols-3">
                  <Field label="Goal" value={p.goal} />
                  <Field label="Method" value={p.method} />
                  <Field label="Outcome" value={p.outcome} />
                </dl>

                {skills.length > 0 && (
                  <div className="mt-4">
                    <div className="label">Skills</div>
                    <ul className="flex flex-wrap gap-1.5">
                      {skills.map((s) => (
                        <li key={s} className="badge">
                          {s}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {files.length > 0 && (
                  <div className="mt-4">
                    <div className="label">Files</div>
                    <ul className="space-y-1 text-sm">
                      {files.map((f) => (
                        <li key={f}>
                          <a className="hover:underline" href={f} target="_blank" rel="noreferrer">
                            {f.split("/").pop()}
                          </a>
                        </li>
                      ))}
                    </ul>
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

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="label">{label}</div>
      <div className="text-sm">{value}</div>
    </div>
  );
}
