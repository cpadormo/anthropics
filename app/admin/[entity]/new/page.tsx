import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { requireAdmin } from "@/lib/auth";
import { entities } from "@/lib/entities";
import { PageHeader } from "@/components/layout/PageHeader";
import { EntityForm } from "@/components/forms/EntityForm";
import { upsertAction } from "../../actions";

export default async function NewEntityPage({ params }: { params: { entity: string } }) {
  if (!(await requireAdmin())) redirect("/admin/login");
  const entity = entities[params.entity];
  if (!entity) notFound();
  if (entity.prismaModel === "profile") redirect("/admin/profile/edit");

  const entityKey = entity.key;
  async function submit(formData: FormData) {
    "use server";
    await upsertAction(entityKey, null, formData);
  }

  return (
    <div>
      <Link href={`/admin/${entity.key}`} className="mb-3 inline-flex items-center gap-1.5 text-sm" style={{ color: "var(--text-soft)" }}>
        <ArrowLeft className="h-3.5 w-3.5" /> Back to {entity.plural}
      </Link>
      <PageHeader title={`Add ${entity.label}`} />
      <div className="card p-6">
        <EntityForm entity={entity} action={submit} />
      </div>
    </div>
  );
}
