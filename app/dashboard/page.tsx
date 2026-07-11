import Link from "next/link";
import {
  Award as AwardIcon,
  BookOpen,
  Briefcase,
  FileText,
  FlaskConical,
  Gavel,
  GraduationCap,
  Scale,
  Sparkle,
  Sparkles,
  Star,
  Trophy,
  Users2,
} from "lucide-react";
import { prisma } from "@/lib/db/client";
import { PageHeader } from "@/components/layout/PageHeader";
import { StatCard } from "@/components/ui/StatCard";
import { compareCoursesRecent, dateStringToScore } from "@/lib/utils";

function gradeToGpa(grade: string | null | undefined): number | null {
  if (!grade) return null;
  const map: Record<string, number> = {
    "A+": 4.0,
    A: 4.0,
    "A-": 3.7,
    "B+": 3.3,
    B: 3.0,
    "B-": 2.7,
    "C+": 2.3,
    C: 2.0,
    "C-": 1.7,
    D: 1.0,
    F: 0.0,
  };
  return map[grade.trim()] ?? null;
}

export default async function DashboardPage() {
  const [
    courses,
    labs,
    papers,
    internships,
    extracurriculars,
    workExperiences,
    awards,
    leadership,
    profile,
  ] = await Promise.all([
    prisma.course.findMany(),
    prisma.researchLab.findMany(),
    prisma.paper.findMany(),
    prisma.internship.findMany(),
    prisma.volunteer.findMany(),
    prisma.workExperience.findMany(),
    prisma.award.findMany(),
    prisma.leadership.findMany(),
    prisma.profile.findFirst(),
  ]);

  const totalCredits = courses.reduce((acc, c) => acc + (c.credits ?? 0), 0);

  let qualityPoints = 0;
  let gpaCredits = 0;
  for (const c of courses) {
    const g = gradeToGpa(c.finalGrade);
    if (g != null) {
      qualityPoints += g * c.credits;
      gpaCredits += c.credits;
    }
  }
  const gpa = gpaCredits > 0 ? (qualityPoints / gpaCredits).toFixed(2) : "—";

  const psychCourses = courses.filter((c) => c.category === "Psychology").length;
  const lawCourses = courses.filter((c) => c.category === "Law" || c.category === "Pre-Law").length;
  const justiceCourses = courses.filter((c) => c.category === "Justice Studies").length;
  const honorsCourses = courses.filter((c) => c.category === "Honors Section / Seminar").length;

  const researchHours = labs.length * 120;

  const internshipRows = internships.filter((i) => (i.type || "Internship") === "Internship");
  const professionalWorkRows = internships.filter((i) => i.type === "Professional Work");
  const internshipHours = internshipRows.reduce((acc, i) => acc + i.hours, 0);
  const professionalWorkHours = professionalWorkRows.reduce((acc, i) => acc + i.hours, 0);

  const publications = papers.filter((p) => p.type === "Research" || p.type === "Literature Review").length;

  const recentInternship = [...internships].sort((a, b) => {
    const scoreDiff = dateStringToScore(b.startDate) - dateStringToScore(a.startDate);
    if (scoreDiff !== 0) return scoreDiff;
    return b.createdAt.getTime() - a.createdAt.getTime();
  })[0];

  return (
    <div>
      <PageHeader
        title="Dashboard"
        description={
          profile
            ? `${profile.name} · ${profile.major}${profile.minor ? ` · ${profile.minor} minor` : ""}`
            : "Snapshot of your academic record"
        }
      />

      <h2 className="mb-3 mt-2 text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--text-soft)" }}>
        Academics
      </h2>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
        <StatCard label="Credits Completed" value={totalCredits} icon={GraduationCap} />
        <StatCard label="Cumulative GPA" value={gpa} icon={Sparkles} hint={gpaCredits > 0 ? `${gpaCredits} credits weighted` : "Add grades"} />
        <StatCard label="Psychology Courses" value={psychCourses} icon={BookOpen} />
        <StatCard label="Law / Pre-Law Courses" value={lawCourses} icon={Scale} />
        <StatCard label="Justice Studies" value={justiceCourses} icon={Gavel} />
        <StatCard label="Honors Sections / Seminars" value={honorsCourses} icon={Star} />
      </div>

      <h2 className="mb-3 mt-8 text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--text-soft)" }}>
        Experience
      </h2>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
        <StatCard label="Research Hours" value={researchHours} icon={FlaskConical} hint={`${labs.length} active lab${labs.length === 1 ? "" : "s"}`} />
        <StatCard
          label="Internship Hours"
          value={internshipHours}
          icon={Briefcase}
          hint={`${internshipRows.length} internship${internshipRows.length === 1 ? "" : "s"}`}
        />
        <StatCard
          label="Professional Work Hours"
          value={professionalWorkHours}
          icon={Briefcase}
          hint={`${professionalWorkRows.length} role${professionalWorkRows.length === 1 ? "" : "s"}`}
        />
        <StatCard
          label="Other Work"
          value={workExperiences.length}
          icon={Briefcase}
          hint={workExperiences.length === 1 ? "position" : "positions"}
        />
        <StatCard
          label="Extracurriculars"
          value={extracurriculars.length}
          icon={Sparkle}
          hint={extracurriculars.length === 1 ? "activity" : "activities"}
        />
      </div>

      <h2 className="mb-3 mt-8 text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--text-soft)" }}>
        Growth
      </h2>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
        <StatCard label="Publications" value={publications} icon={FileText} hint="research + reviews" />
        <StatCard label="Awards" value={awards.length} icon={Trophy} />
        <StatCard label="Leadership Roles" value={leadership.length} icon={Users2} hint="clubs & student gov" />
      </div>

      <div className="mt-10 grid gap-4 lg:grid-cols-3">
        <div className="card p-6 lg:col-span-2">
          <h2 className="text-base font-semibold">Most recent course</h2>
          {(() => {
            const recent = [...courses].sort(compareCoursesRecent)[0];
            return recent ? (
              <div className="mt-3">
                <div className="text-sm font-medium">
                  {recent.code} · {recent.title}
                </div>
                <div className="mt-1 text-xs" style={{ color: "var(--text-soft)" }}>
                  {recent.semester} {recent.year} · {recent.instructor}
                </div>
                <p className="mt-3 line-clamp-3 text-sm">{recent.reflection}</p>
                <Link href="/coursework" className="mt-3 inline-block text-xs font-medium hover:underline" style={{ color: "var(--accent)" }}>
                  View all coursework →
                </Link>
              </div>
            ) : null;
          })()}
          {courses.length === 0 && (
            <p className="mt-3 text-sm" style={{ color: "var(--text-soft)" }}>
              Add coursework through the admin panel.
            </p>
          )}
        </div>
        <div className="card p-6">
          <h2 className="text-base font-semibold">Most recent award</h2>
          {awards[0] ? (
            <div className="mt-3">
              <div className="flex items-center gap-2">
                <AwardIcon className="h-4 w-4" />
                <span className="text-sm font-medium">{awards[0].title}</span>
              </div>
              <div className="mt-1 text-xs" style={{ color: "var(--text-soft)" }}>
                {awards[0].issuer} · {awards[0].date}
              </div>
              <p className="mt-2 text-sm">{awards[0].description}</p>
            </div>
          ) : (
            <p className="mt-3 text-sm" style={{ color: "var(--text-soft)" }}>
              Award history will appear here.
            </p>
          )}
        </div>
      </div>

      {recentInternship && (
        <div className="mt-4 grid gap-4">
          <div className="card p-6">
            <h2 className="text-base font-semibold">Most recent internship / professional work</h2>
            <div className="mt-3 flex flex-wrap items-baseline justify-between gap-2">
              <div>
                <div className="text-sm font-medium">{recentInternship.organization}</div>
                <div className="mt-1 text-xs" style={{ color: "var(--text-soft)" }}>
                  Supervisor: {recentInternship.supervisor}
                  {recentInternship.startDate ? ` · ${recentInternship.startDate}` : ""}
                  {recentInternship.hours > 0 ? ` · ${recentInternship.hours} hours` : ""}
                </div>
              </div>
              <span className="badge">{recentInternship.type || "Internship"}</span>
            </div>
            {recentInternship.reflection && (
              <p className="mt-3 line-clamp-2 text-sm italic" style={{ color: "var(--text-soft)" }}>
                {recentInternship.reflection}
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
