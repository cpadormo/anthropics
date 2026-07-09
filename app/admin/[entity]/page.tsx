import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Plus, Pencil } from "lucide-react";
import { prisma } from "@/lib/db/client";
import { entities } from "@/lib/entities";
import { requireAdmin } from "@/lib/auth";
import { PageHeader } from "@/components/layout/PageHeader";
import { deleteAction } from "../actions";

export default async function EntityListPage({ params }: { params: { entity: string } }) {
  if (!(await requireAdmin())) redirect("/admin/login");

  const entity = entities[params.entity];
  if (!entity) notFound();
  if (entity.prismaModel === "profile") redirect("/admin/profile/edit");

  const model = (prisma as unknown as Record<string, { findMany: (args?: unknown) => Promise<Array<Record<string, unknown>>> }>)[
    entity.prismaModel
  ];
  const rows = await model.findMany();

  const labelFor = (row: Record<string, unknown>) => {
    return (
      (row.title as string) ||
      (row.name as string) ||
      (row.code as string) ||
      (row.organization as string) ||
      (row.id as string)
    );
  };

  const subtitleFor = (row: Record<string, unknown>) => {
    if (entity.key === "course") return `${row.semester} ${row.year} · ${row.instructor}`;
    if (entity.key === "paper") return `${row.type} · ${row.date}`;
    if (entity.key === "internship") return `${row.supervisor ?? ""}${row.hours ? ` · ${row.hours} hrs` : ""}`;
    if (entity.key === "extracurricular" || entity.key === "leadership" || entity.key === "work") return `${row.role ?? row.position ?? ""} · ${row.startDate ?? ""}`;
    if (entity.key === "award") return `${row.issuer} · ${row.date}`;
    if (entity.key === "cert") return `${row.issuer} · ${row.date}`;
    if (entity.key === "timeline") return `${row.year} · ${row.date}`;
    if (entity.key === "goal") return `${row.category} · ${row.status}`;
    if (entity.key === "skill") return `${row.category} · ${row.level}`;
    if (entity.key === "lab") return `${row.role} · Mentor ${row.mentor}`;
    if (entity.key === "project") return `${row.course ?? "—"} · ${row.date}`;
    if (entity.key === "gallery") return `${row.category} · ${row.date}`;
    return "";
  };

  return (
    <div>
      <Link href="/admin" className="mb-3 inline-flex items-center gap-1.5 text-sm" style={{ color: "var(--text-soft)" }}>
        <ArrowLeft className="h-3.5 w-3.5" /> Back to admin
      </Link>
      <PageHeader
        title={entity.plural}
        description={`${rows.length} entry${rows.length === 1 ? "" : "ies"}`}
        actions={
          <Link href={`/admin/${entity.key}/new`} className="btn-primary">
            <Plus className="h-4 w-4" /> Add {entity.label}
          </Link>
        }
      />

      {rows.length === 0 ? (
        <p className="text-sm" style={{ color: "var(--text-soft)" }}>
          No entries yet.
        </p>
      ) : (
        <ul className="card divide-y" style={{ borderColor: "var(--border)" }}>
          {rows.map((row) => {
            const id = row.id as string;
            const del = async () => {
              "use server";
              await deleteAction(entity.key, id);
            };
            return (
              <li key={id} className="flex flex-wrap items-center justify-between gap-3 p-4">
                <div className="min-w-0">
                  <div className="font-medium">{labelFor(row)}</div>
                  <div className="text-xs" style={{ color: "var(--text-soft)" }}>
                    {subtitleFor(row)}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Link href={`/admin/${entity.key}/${id}`} className="btn-ghost">
                    <Pencil className="h-4 w-4" /> Edit
                  </Link>
                  <form action={del}>
                    <button
                      type="submit"
                      className="btn-ghost"
                      style={{ color: "#dc2626" }}
                    >
                      Delete
                    </button>
                  </form>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
