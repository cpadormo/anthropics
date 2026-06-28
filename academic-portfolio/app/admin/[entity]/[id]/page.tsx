import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { prisma } from "@/lib/db/client";
import { entities } from "@/lib/entities";
import { requireAdmin } from "@/lib/auth";
import { PageHeader } from "@/components/layout/PageHeader";
import { EntityForm } from "@/components/forms/EntityForm";
import { upsertAction } from "../../actions";

export default async function EditEntityPage({ params }: { params: { entity: string; id: string } }) {
  if (!(await requireAdmin())) redirect("/admin/login");
  const entity = entities[params.entity];
  if (!entity) notFound();
  if (entity.prismaModel === "profile") redirect("/admin/profile/edit");

  const model = (prisma as unknown as Record<string, { findUnique: (args: unknown) => Promise<Record<string, unknown> | null> }>)[
    entity.prismaModel
  ];
  const row = await model.findUnique({ where: { id: params.id } });
  if (!row) notFound();

  const entityKey = entity.key;
  const id = params.id;
  async function submit(formData: FormData) {
    "use server";
    await upsertAction(entityKey, id, formData);
  }

  return (
    <div>
      <Link href={`/admin/${entity.key}`} className="mb-3 inline-flex items-center gap-1.5 text-sm" style={{ color: "var(--text-soft)" }}>
        <ArrowLeft className="h-3.5 w-3.5" /> Back to {entity.plural}
      </Link>
      <PageHeader title={`Edit ${entity.label}`} />
      <div className="card p-6">
        <EntityForm entity={entity} initial={row} action={submit} />
      </div>
    </div>
  );
}
