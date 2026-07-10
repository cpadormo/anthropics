import Link from "next/link";
import { prisma } from "@/lib/db/client";
import { PageHeader } from "@/components/layout/PageHeader";
import { EmptyState } from "@/components/ui/EmptyState";
import { Briefcase, ExternalLink } from "lucide-react";
import { dateStringToScore } from "@/lib/utils";

const FILTERS = [
  { value: "all", label: "All" },
  { value: "Internship", label: "Internships" },
  { value: "Professional Work", label: "Professional Work" },
] as const;

type FilterValue = (typeof FILTERS)[number]["value"];

export default async function InternshipsPage({ searchParams }: { searchParams: { type?: string } }) {
  const rows = await prisma.internship.findMany();

  const sorted = [...rows].sort((a, b) => {
    const scoreDiff = dateStringToScore(b.startDate) - dateStringToScore(a.startDate);
    if (scoreDiff !== 0) return scoreDiff;
    return b.createdAt.getTime() - a.createdAt.getTime();
  });

  const activeFilter: FilterValue = FILTERS.some((f) => f.value === searchParams.type)
    ? (searchParams.type as FilterValue)
    : "all";

  const items =
    activeFilter === "all"
      ? sorted
      : sorted.filter((i) => (i.type || "Internship") === activeFilter);

  const counts = {
    all: sorted.length,
    Internship: sorted.filter((i) => (i.type || "Internship") === "Internship").length,
    "Professional Work": sorted.filter((i) => (i.type || "Internship") === "Professional Work").length,
  };

  return (
    <div>
      <PageHeader
        title="Internships / Professional Work"
        description="Internships and career-relevant professional roles. Most recent first."
      />

      <div className="mb-6 flex flex-wrap gap-2">
        {FILTERS.map((f) => {
          const active = activeFilter === f.value;
          const href = f.value === "all" ? "/internships" : `/internships?type=${encodeURIComponent(f.value)}`;
          const count = counts[f.value as keyof typeof counts];
          return (
            <Link
              key={f.value}
              href={href}
              className="btn-ghost"
              style={
                active
                  ? { background: "var(--accent)", color: "white", borderColor: "var(--accent)" }
                  : undefined
              }
            >
              {f.label}
              <span
                className="ml-1 rounded-full px-1.5 py-0.5 text-[10px] font-semibold"
                style={{
                  background: active ? "rgba(255,255,255,0.25)" : "var(--accent-soft)",
                  color: active ? "white" : "var(--text-soft)",
                }}
              >
                {count}
              </span>
            </Link>
          );
        })}
      </div>

      {items.length === 0 ? (
        <EmptyState
          icon={<Briefcase className="h-8 w-8 opacity-40" />}
          title={activeFilter === "all" ? "No entries yet" : `No ${activeFilter === "Internship" ? "internships" : "professional work"} yet`}
          addHref="/admin/internship/new"
        />
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
