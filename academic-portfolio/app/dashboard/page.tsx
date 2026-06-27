import {
  Award as AwardIcon,
  BookOpen,
  Briefcase,
  FlaskConical,
  FileText,
  GraduationCap,
  HeartHandshake,
  Presentation,
  Scale,
  Sparkles,
  Trophy,
  Users2,
} from "lucide-react";
import { prisma } from "@/lib/db/client";
import { PageHeader } from "@/components/layout/PageHeader";
import { StatCard } from "@/components/ui/StatCard";

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
    volunteer,
    conferences,
    awards,
    leadership,
    profile,
  ] = await Promise.all([
    prisma.course.findMany(),
    prisma.researchLab.findMany(),
    prisma.paper.findMany(),
    prisma.internship.findMany(),
    prisma.volunteer.findMany(),
    prisma.conference.findMany(),
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

  const researchHours = labs.length * 120;
  const volunteerHours = volunteer.reduce((acc, v) => acc + v.hours, 0);
  const internshipHours = internships.reduce((acc, i) => acc + i.hours, 0);

  const presentations = conferences.filter((c) => c.posterTitle || c.presentationTitle).length;
  const publications = papers.filter((p) => p.type === "Research" || p.type === "Literature Review").length;

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

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        <StatCard label="Credits Completed" value={totalCredits} icon={GraduationCap} hint="across all transcripted courses" />
        <StatCard label="Cumulative GPA" value={gpa} icon={Sparkles} hint={gpaCredits > 0 ? `${gpaCredits} credits weighted` : "Add grades to compute"} />
        <StatCard label="Psychology Courses" value={psychCourses} icon={BookOpen} />
        <StatCard label="Law / Pre-Law Courses" value={lawCourses} icon={Scale} />
        <StatCard label="Research Hours" value={researchHours} icon={FlaskConical} hint={`${labs.length} active lab${labs.length === 1 ? "" : "s"}`} />
        <StatCard label="Volunteer Hours" value={volunteerHours} icon={HeartHandshake} />
        <StatCard label="Internship Hours" value={internshipHours} icon={Briefcase} />
        <StatCard label="Conferences" value={conferences.length} icon={Presentation} hint={`${presentations} presented`} />
        <StatCard label="Presentations" value={presentations} icon={Presentation} />
        <StatCard label="Publications" value={publications} icon={FileText} hint="research + reviews" />
        <StatCard label="Awards" value={awards.length} icon={Trophy} />
        <StatCard label="Leadership Roles" value={leadership.length} icon={Users2} hint="club & student government" />
      </div>

      <div className="mt-8 grid gap-4 lg:grid-cols-3">
        <div className="card p-6 lg:col-span-2">
          <h2 className="text-base font-semibold">Most recent course</h2>
          {courses[0] ? (
            <div className="mt-3">
              <div className="text-sm font-medium">
                {courses[0].code} · {courses[0].title}
              </div>
              <div className="mt-1 text-xs" style={{ color: "var(--text-soft)" }}>
                {courses[0].semester} {courses[0].year} · {courses[0].instructor}
              </div>
              <p className="mt-3 line-clamp-3 text-sm">{courses[0].reflection}</p>
            </div>
          ) : (
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
    </div>
  );
}
