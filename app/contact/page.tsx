import { prisma } from "@/lib/db/client";
import { PageHeader } from "@/components/layout/PageHeader";
import { Github, Linkedin, Mail } from "lucide-react";

export default async function ContactPage() {
  const profile = await prisma.profile.findFirst();

  return (
    <div>
      <PageHeader title="Contact" description="Professional outreach welcome." />

      <div className="card max-w-xl p-6">
        <dl className="space-y-3 text-sm">
          {profile?.email && (
            <Row label={<><Mail className="h-4 w-4" /> Email</>}>
              <a className="hover:underline" href={`mailto:${profile.email}`}>
                {profile.email}
              </a>
            </Row>
          )}
          {profile?.linkedinUrl && (
            <Row label={<><Linkedin className="h-4 w-4" /> LinkedIn</>}>
              <a className="hover:underline" href={profile.linkedinUrl} target="_blank" rel="noreferrer">
                {profile.linkedinUrl.replace(/^https?:\/\//, "")}
              </a>
            </Row>
          )}
          {profile?.githubUrl && (
            <Row label={<><Github className="h-4 w-4" /> GitHub</>}>
              <a className="hover:underline" href={profile.githubUrl} target="_blank" rel="noreferrer">
                {profile.githubUrl.replace(/^https?:\/\//, "")}
              </a>
            </Row>
          )}
        </dl>
      </div>
    </div>
  );
}

function Row({ label, children }: { label: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <dt className="inline-flex items-center gap-1.5" style={{ color: "var(--text-soft)" }}>
        {label}
      </dt>
      <dd className="text-right">{children}</dd>
    </div>
  );
}
