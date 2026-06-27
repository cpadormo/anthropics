import Link from "next/link";
import { redirect } from "next/navigation";
import { Plus } from "lucide-react";
import { prisma } from "@/lib/db/client";
import { entityList } from "@/lib/entities";
import { requireAdmin } from "@/lib/auth";
import { PageHeader } from "@/components/layout/PageHeader";
import { logoutAction } from "./actions";

export default async function AdminHome() {
  if (!(await requireAdmin())) redirect("/admin/login");

  const counts: Record<string, number> = {};
  for (const e of entityList) {
    if (e.prismaModel === "profile") continue;
    const model = (prisma as unknown as Record<string, { count: () => Promise<number> }>)[e.prismaModel];
    counts[e.key] = await model.count();
  }

  const profile = await prisma.profile.findFirst();

  return (
    <div>
      <PageHeader
        title="Admin"
        description="Add, edit, and delete entries across the portfolio. No code editing required."
        actions={
          <form action={logoutAction}>
            <button type="submit" className="btn-ghost">
              Sign out
            </button>
          </form>
        }
      />

      <section className="card mb-6 p-5">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <h2 className="text-base font-semibold">Profile</h2>
          <Link className="btn-ghost" href="/admin/profile/edit">
            {profile ? "Edit profile" : "Create profile"}
          </Link>
        </div>
        {profile && (
          <div className="mt-2 text-sm" style={{ color: "var(--text-soft)" }}>
            {profile.name} · {profile.university}
          </div>
        )}
      </section>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {entityList
          .filter((e) => e.prismaModel !== "profile")
          .map((e) => (
            <div key={e.key} className="card p-5">
              <div className="flex items-baseline justify-between">
                <h3 className="text-base font-semibold">{e.plural}</h3>
                <span className="text-xs tabular-nums" style={{ color: "var(--text-soft)" }}>
                  {counts[e.key] ?? 0}
                </span>
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                <Link href={`/admin/${e.key}/new`} className="btn-primary">
                  <Plus className="h-4 w-4" /> Add
                </Link>
                <Link href={`/admin/${e.key}`} className="btn-ghost">
                  Manage
                </Link>
              </div>
            </div>
          ))}
      </div>

    </div>
  );
}
