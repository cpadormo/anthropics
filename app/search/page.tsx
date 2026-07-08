import Link from "next/link";
import { prisma } from "@/lib/db/client";
import { PageHeader } from "@/components/layout/PageHeader";

type Hit = { href: string; title: string; snippet: string; kind: string };

function matches(q: string, ...fields: (string | null | undefined)[]) {
  const needle = q.toLowerCase();
  return fields.some((f) => f && f.toLowerCase().includes(needle));
}

export default async function SearchPage({ searchParams }: { searchParams: { q?: string } }) {
  const q = (searchParams.q ?? "").trim();

  if (!q) {
    return (
      <div>
        <PageHeader title="Search" description="Search across coursework, papers, projects, research, and more." />
        <p className="text-sm" style={{ color: "var(--text-soft)" }}>
          Enter a query in the search bar above to begin.
        </p>
      </div>
    );
  }

  const [courses, papers, projects, labs, awards] = await Promise.all([
    prisma.course.findMany(),
    prisma.paper.findMany(),
    prisma.project.findMany(),
    prisma.researchLab.findMany(),
    prisma.award.findMany(),
  ]);

  const hits: Hit[] = [];

  for (const c of courses) {
    if (matches(q, c.code, c.title, c.topics, c.description, c.reflection, c.category)) {
      hits.push({
        href: "/coursework",
        title: `${c.code} — ${c.title}`,
        snippet: `${c.semester} ${c.year} · ${c.instructor}`,
        kind: "Course",
      });
    }
  }
  for (const p of papers) {
    if (matches(q, p.title, p.abstract, p.keywords, p.type)) {
      hits.push({ href: "/writing", title: p.title, snippet: p.abstract.slice(0, 140), kind: p.type });
    }
  }
  for (const p of projects) {
    if (matches(q, p.title, p.summary, p.skills, p.outcome)) {
      hits.push({ href: "/projects", title: p.title, snippet: p.summary, kind: "Project" });
    }
  }
  for (const l of labs) {
    if (matches(q, l.name, l.questions, l.methods, l.skills)) {
      hits.push({ href: `/research/${l.id}`, title: l.name, snippet: l.questions.slice(0, 140), kind: "Research" });
    }
  }
  for (const a of awards) {
    if (matches(q, a.title, a.issuer, a.description, a.category)) {
      hits.push({ href: "/awards", title: a.title, snippet: `${a.issuer} · ${a.date}`, kind: "Award" });
    }
  }

  return (
    <div>
      <PageHeader title={`Search results for "${q}"`} description={`${hits.length} match${hits.length === 1 ? "" : "es"}`} />
      {hits.length === 0 ? (
        <p className="text-sm" style={{ color: "var(--text-soft)" }}>
          No matches. Try a broader query.
        </p>
      ) : (
        <ul className="space-y-2">
          {hits.map((h, idx) => (
            <li key={`${h.href}-${idx}`}>
              <Link href={h.href} className="card block p-4">
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <span className="text-sm font-semibold">{h.title}</span>
                  <span className="badge">{h.kind}</span>
                </div>
                <p className="mt-1 text-sm" style={{ color: "var(--text-soft)" }}>
                  {h.snippet}
                </p>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
