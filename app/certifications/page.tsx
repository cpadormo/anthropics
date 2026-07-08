import { prisma } from "@/lib/db/client";
import { PageHeader } from "@/components/layout/PageHeader";
import { EmptyState } from "@/components/ui/EmptyState";
import { BadgeCheck } from "lucide-react";

export default async function CertificationsPage() {
  const items = await prisma.certification.findMany({ orderBy: { date: "desc" } });

  return (
    <div>
      <PageHeader title="Certifications" description="Trainings completed and credentials earned." />
      {items.length === 0 ? (
        <EmptyState icon={<BadgeCheck className="h-8 w-8 opacity-40" />} title="No certifications yet" addHref="/admin/cert/new" />
      ) : (
        <div className="card divide-y" style={{ borderColor: "var(--border)" }}>
          {items.map((c) => (
            <div key={c.id} className="flex flex-wrap items-baseline justify-between gap-2 p-4">
              <div>
                <div className="font-medium">{c.name}</div>
                <div className="text-xs" style={{ color: "var(--text-soft)" }}>
                  {c.issuer}
                </div>
              </div>
              <div className="text-xs text-right" style={{ color: "var(--text-soft)" }}>
                <div>Earned {c.date}</div>
                {c.expires && <div>Expires {c.expires}</div>}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
