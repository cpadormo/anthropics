import { redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { prisma } from "@/lib/db/client";
import { requireAdmin } from "@/lib/auth";
import { entities } from "@/lib/entities";
import { PageHeader } from "@/components/layout/PageHeader";
import { EntityForm } from "@/components/forms/EntityForm";
import { upsertAction } from "../../actions";

export default async function ProfileEditPage() {
  if (!(await requireAdmin())) redirect("/admin/login");

  const profile = await prisma.profile.findFirst();
  const entity = entities.profile;

  async function submit(formData: FormData) {
    "use server";
    await upsertAction("profile", null, formData);
  }

  return (
    <div>
      <Link href="/admin" className="mb-3 inline-flex items-center gap-1.5 text-sm" style={{ color: "var(--text-soft)" }}>
        <ArrowLeft className="h-3.5 w-3.5" /> Back to admin
      </Link>
      <PageHeader title={profile ? "Edit profile" : "Create profile"} />
      <div className="card p-6">
        <EntityForm entity={entity} initial={profile as Record<string, unknown> | null} action={submit} />
      </div>
    </div>
  );
}
