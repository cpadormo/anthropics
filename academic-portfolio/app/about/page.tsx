import { prisma } from "@/lib/db/client";
import { PageHeader } from "@/components/layout/PageHeader";

export default async function AboutPage() {
  const profile = await prisma.profile.findFirst();

  if (!profile) {
    return (
      <div>
        <PageHeader title="About" description="Add your profile in the admin panel to populate this page." />
      </div>
    );
  }

  return (
    <div>
      <PageHeader title="About" description="A snapshot of who I am and what I'm working toward." />
      <div className="card max-w-3xl p-6">
        <h2 className="text-xl font-semibold">{profile.name}</h2>
        <div className="mt-1 text-sm" style={{ color: "var(--text-soft)" }}>
          {profile.university} · {profile.major}
          {profile.minor && ` · ${profile.minor} minor`}
          {profile.expectedGrad && ` · Expected ${profile.expectedGrad}`}
        </div>
        <p className="mt-4 text-sm leading-relaxed">{profile.bio}</p>
      </div>
    </div>
  );
}
