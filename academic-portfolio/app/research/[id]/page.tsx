import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { prisma } from "@/lib/db/client";
import { PageHeader } from "@/components/layout/PageHeader";
import { formatDateRange, parseJsonArray, splitLines } from "@/lib/utils";

export default async function LabDetail({ params }: { params: { id: string } }) {
  const lab = await prisma.researchLab.findUnique({ where: { id: params.id } });
  if (!lab) notFound();

  const methods = splitLines(lab.methods);
  const responsibilities = splitLines(lab.responsibilities);
  const skills = splitLines(lab.skills);
  const posters = parseJsonArray(lab.posters);
  const papers = parseJsonArray(lab.papers);

  return (
    <div>
      <Link href="/research" className="mb-3 inline-flex items-center gap-1.5 text-sm" style={{ color: "var(--text-soft)" }}>
        <ArrowLeft className="h-3.5 w-3.5" /> All labs
      </Link>
      <PageHeader
        title={lab.name}
        description={`${lab.role} · Mentor: ${lab.mentor} · ${formatDateRange(lab.startDate, lab.endDate)}`}
      />

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="card p-6 lg:col-span-2">
          <h2 className="label">Research questions</h2>
          <p className="text-sm leading-relaxed">{lab.questions}</p>

          <h2 className="label mt-6">Methods learned</h2>
          <ul className="flex flex-wrap gap-1.5">
            {methods.map((m) => (
              <li key={m} className="badge">
                {m}
              </li>
            ))}
          </ul>

          <h2 className="label mt-6">Responsibilities</h2>
          <ul className="list-disc space-y-1 pl-5 text-sm">
            {responsibilities.map((r) => (
              <li key={r}>{r}</li>
            ))}
          </ul>

          <h2 className="label mt-6">Skills gained</h2>
          <ul className="flex flex-wrap gap-1.5">
            {skills.map((s) => (
              <li key={s} className="badge">
                {s}
              </li>
            ))}
          </ul>

          <h2 className="label mt-6">Reflection</h2>
          <p className="text-sm italic leading-relaxed" style={{ color: "var(--text-soft)" }}>
            {lab.reflection}
          </p>
        </div>

        <div className="space-y-4">
          <div className="card p-6">
            <h2 className="label">Poster presentations</h2>
            {posters.length === 0 ? (
              <p className="text-sm" style={{ color: "var(--text-soft)" }}>
                No posters yet.
              </p>
            ) : (
              <ul className="space-y-1.5 text-sm">
                {posters.map((p) => (
                  <li key={p}>{p}</li>
                ))}
              </ul>
            )}
          </div>
          <div className="card p-6">
            <h2 className="label">Papers contributed to</h2>
            {papers.length === 0 ? (
              <p className="text-sm" style={{ color: "var(--text-soft)" }}>
                None listed yet.
              </p>
            ) : (
              <ul className="space-y-1.5 text-sm">
                {papers.map((p) => (
                  <li key={p}>{p}</li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
