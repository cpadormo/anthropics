import Link from "next/link";
import { ArrowRight, BookOpen, FlaskConical, FolderKanban, Mail } from "lucide-react";
import { prisma } from "@/lib/db/client";

export default async function HomePage() {
  const [profile, courseCount, paperCount, labCount] = await Promise.all([
    prisma.profile.findFirst(),
    prisma.course.count(),
    prisma.paper.count(),
    prisma.researchLab.count(),
  ]);

  return (
    <div className="space-y-10">
      <section className="card overflow-hidden">
        <div className="p-8 sm:p-12">
          <div className="badge mb-4">{profile?.university ?? "University"}</div>
          <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
            {profile?.name ?? "Your Name"}
          </h1>
          <p className="mt-3 max-w-2xl text-base" style={{ color: "var(--text-soft)" }}>
            {profile?.tagline ??
              "An undergraduate portfolio designed to showcase coursework, research, writing, and growth in one place."}
          </p>
          <p className="mt-4 max-w-2xl text-sm leading-relaxed">
            {profile?.bio ??
              "Use the Admin panel to add your own profile, coursework, research, projects, papers, internships, and more."}
          </p>
          <div className="mt-6 flex flex-wrap gap-2">
            <Link href="/dashboard" className="btn-primary">
              View dashboard <ArrowRight className="h-4 w-4" />
            </Link>
            <Link href="/coursework" className="btn-ghost">
              Coursework
            </Link>
            <Link href="/research" className="btn-ghost">
              Research
            </Link>
            <Link href="/writing" className="btn-ghost">
              Writing
            </Link>
            <Link href="/resume" className="btn-ghost">
              Resume
            </Link>
          </div>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-3">
        <FeatureLink
          href="/coursework"
          icon={<BookOpen className="h-5 w-5" />}
          title="Coursework"
          hint={`${courseCount} course${courseCount === 1 ? "" : "s"} archived`}
        />
        <FeatureLink
          href="/research"
          icon={<FlaskConical className="h-5 w-5" />}
          title="Research"
          hint={`${labCount} lab${labCount === 1 ? "" : "s"} · ongoing`}
        />
        <FeatureLink
          href="/writing"
          icon={<FolderKanban className="h-5 w-5" />}
          title="Writing"
          hint={`${paperCount} paper${paperCount === 1 ? "" : "s"} in portfolio`}
        />
      </section>

      <section className="card p-6">
        <h2 className="text-lg font-semibold">Get in touch</h2>
        <p className="mt-1 text-sm" style={{ color: "var(--text-soft)" }}>
          Professional outreach welcome. The fastest way to reach me is email.
        </p>
        <Link href="/contact" className="btn-ghost mt-4">
          <Mail className="h-4 w-4" /> Contact details
        </Link>
      </section>
    </div>
  );
}

function FeatureLink({
  href,
  icon,
  title,
  hint,
}: {
  href: string;
  icon: React.ReactNode;
  title: string;
  hint: string;
}) {
  return (
    <Link href={href} className="card group p-5">
      <div className="flex items-center gap-3">
        <div
          className="grid h-10 w-10 place-items-center rounded-md"
          style={{ background: "var(--accent-soft)", color: "var(--accent)" }}
        >
          {icon}
        </div>
        <div>
          <div className="font-semibold">{title}</div>
          <div className="text-xs" style={{ color: "var(--text-soft)" }}>
            {hint}
          </div>
        </div>
        <ArrowRight className="ml-auto h-4 w-4 transition-transform group-hover:translate-x-0.5" />
      </div>
    </Link>
  );
}
