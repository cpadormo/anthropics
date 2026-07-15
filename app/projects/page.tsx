import { prisma } from "@/lib/db/client";
import { PageHeader } from "@/components/layout/PageHeader";
import { EmptyState } from "@/components/ui/EmptyState";
import { Download, ExternalLink, FolderKanban, Video } from "lucide-react";
import { dateStringToScore } from "@/lib/utils";

export default async function ProjectsPage() {
  const rows = await prisma.project.findMany();
  const projects = [...rows].sort((a, b) => {
    const scoreDiff = dateStringToScore(b.date) - dateStringToScore(a.date);
    if (scoreDiff !== 0) return scoreDiff;
    return b.createdAt.getTime() - a.createdAt.getTime();
  });

  return (
    <div>
      <PageHeader title="Projects" description="Course projects and self-directed work. Most recent first." />

      {projects.length === 0 ? (
        <EmptyState
          icon={<FolderKanban className="h-8 w-8 opacity-40" />}
          title="No projects yet"
          hint="Add a project with title, course, date, grade, and a submission."
          addHref="/admin/project/new"
        />
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {projects.map((p) => (
            <article key={p.id} className="card p-6">
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <h2 className="text-base font-semibold">{p.title}</h2>
                {p.grade && <span className="badge">Grade · {p.grade}</span>}
              </div>
              <div className="mt-1 text-xs" style={{ color: "var(--text-soft)" }}>
                {p.course && <>{p.course} · </>}
                {p.date}
              </div>

              {p.instructions && (
                <div className="mt-4">
                  <div className="label">Instructions summary</div>
                  <p className="text-sm">{p.instructions}</p>
                </div>
              )}

              {p.submissionVideo && (
                <video
                  src={p.submissionVideo}
                  controls
                  playsInline
                  className="mt-4 w-full rounded-lg border"
                  style={{ borderColor: "var(--border)" }}
                />
              )}

              <div className="mt-4 flex flex-wrap gap-2">
                {p.submissionPdf && (
                  <a
                    href={p.submissionPdf}
                    download={`${p.title || "project"}.pdf`}
                    target="_blank"
                    rel="noreferrer"
                    className="btn-ghost"
                  >
                    <Download className="h-4 w-4" /> Download PDF
                  </a>
                )}
                {p.submissionUrl && (
                  <a
                    href={p.submissionUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="btn-ghost"
                  >
                    <ExternalLink className="h-4 w-4" /> View slideshow
                  </a>
                )}
                {p.submissionVideoUrl && (
                  <a
                    href={p.submissionVideoUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="btn-ghost"
                  >
                    <Video className="h-4 w-4" /> Watch video
                  </a>
                )}
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
