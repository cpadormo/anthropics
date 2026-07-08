import Link from "next/link";
import { prisma } from "@/lib/db/client";
import { PageHeader } from "@/components/layout/PageHeader";
import { EmptyState } from "@/components/ui/EmptyState";
import { FlaskConical } from "lucide-react";
import { formatDateRange } from "@/lib/utils";

export default async function ResearchPage() {
  const labs = await prisma.researchLab.findMany({ orderBy: { createdAt: "desc" } });

  if (labs.length === 0) {
    return (
      <div>
        <PageHeader title="Research" description="Labs, mentors, methods, and contributions." />
        <EmptyState
          icon={<FlaskConical className="h-8 w-8 opacity-40" />}
          title="No research labs yet"
          hint="Document each lab as its own profile: questions, methods, responsibilities, skills, and reflection."
          addHref="/admin/lab/new"
        />
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title="Research"
        description="Each lab gets its own profile. Click through for full details — this is one of the most important sections for graduate school."
      />
      <div className="space-y-4">
        {labs.map((lab) => (
          <Link key={lab.id} href={`/research/${lab.id}`} className="card block p-6">
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <h2 className="text-lg font-semibold">{lab.name}</h2>
              <div className="text-xs" style={{ color: "var(--text-soft)" }}>
                {formatDateRange(lab.startDate, lab.endDate)}
              </div>
            </div>
            <div className="mt-1 text-sm" style={{ color: "var(--text-soft)" }}>
              {lab.role} · Mentor: {lab.mentor}
            </div>
            <p className="mt-3 line-clamp-2 text-sm">{lab.questions}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
