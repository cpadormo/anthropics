import { prisma } from "@/lib/db/client";
import { PageHeader } from "@/components/layout/PageHeader";
import { EmptyState } from "@/components/ui/EmptyState";
import { FileText, Download } from "lucide-react";
import { splitLines } from "@/lib/utils";

export default async function WritingPage() {
  const papers = await prisma.paper.findMany({ orderBy: { createdAt: "desc" } });

  const grouped = papers.reduce<Record<string, typeof papers>>((acc, p) => {
    acc[p.type] = acc[p.type] ?? [];
    acc[p.type].push(p);
    return acc;
  }, {});

  return (
    <div>
      <PageHeader
        title="Writing Portfolio"
        description="Research papers, legal analyses, essays, literature reviews, case studies, and reflections — central to JD and graduate applications."
      />

      {papers.length === 0 ? (
        <EmptyState
          icon={<FileText className="h-8 w-8 opacity-40" />}
          title="No papers in the portfolio yet"
          hint="Each entry holds an abstract, course, grade, keywords, and a downloadable PDF."
          addHref="/admin/paper/new"
        />
      ) : (
        <div className="space-y-8">
          {Object.entries(grouped).map(([type, items]) => (
            <section key={type}>
              <h2 className="mb-3 text-base font-semibold">{type}</h2>
              <div className="space-y-3">
                {items.map((p) => {
                  const keywords = splitLines(p.keywords);
                  return (
                    <article key={p.id} className="card p-5">
                      <div className="flex flex-wrap items-baseline justify-between gap-2">
                        <h3 className="text-base font-semibold">{p.title}</h3>
                        <div className="flex items-center gap-2 text-xs" style={{ color: "var(--text-soft)" }}>
                          {p.course && <span>{p.course}</span>}
                          <span>·</span>
                          <span>{p.date}</span>
                          {p.grade && (
                            <>
                              <span>·</span>
                              <span className="badge">{p.grade}</span>
                            </>
                          )}
                        </div>
                      </div>
                      <p className="mt-2 text-sm">{p.abstract}</p>
                      {keywords.length > 0 && (
                        <ul className="mt-3 flex flex-wrap gap-1.5">
                          {keywords.map((k) => (
                            <li key={k} className="badge">
                              {k}
                            </li>
                          ))}
                        </ul>
                      )}
                      {p.pdfUrl && (
                        <a className="btn-ghost mt-4" href={p.pdfUrl} target="_blank" rel="noreferrer">
                          <Download className="h-4 w-4" /> Download PDF
                        </a>
                      )}
                    </article>
                  );
                })}
              </div>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}
