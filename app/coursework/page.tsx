import { prisma } from "@/lib/db/client";
import { PageHeader } from "@/components/layout/PageHeader";
import { CourseCard } from "@/components/widgets/CourseCard";
import { EmptyState } from "@/components/ui/EmptyState";
import { BookOpen } from "lucide-react";

export default async function CourseworkPage() {
  const courses = await prisma.course.findMany({
    orderBy: [{ year: "desc" }, { semester: "asc" }, { code: "asc" }],
  });

  const grouped = courses.reduce<Record<string, typeof courses>>((acc, c) => {
    const key = `${c.semester} ${c.year}`;
    acc[key] = acc[key] ?? [];
    acc[key].push(c);
    return acc;
  }, {});

  return (
    <div>
      <PageHeader
        title="Coursework"
        description="Every course, with topics learned, projects completed, papers written, and a personal reflection."
      />

      {courses.length === 0 ? (
        <EmptyState
          icon={<BookOpen className="h-8 w-8 opacity-40" />}
          title="No courses yet"
          hint="Add your first course through the admin panel to start building your transcript-style archive."
          addHref="/admin/course/new"
        />
      ) : (
        <div className="space-y-8">
          {Object.entries(grouped).map(([term, items]) => (
            <section key={term}>
              <div className="mb-3 flex items-baseline justify-between">
                <h2 className="text-base font-semibold">{term}</h2>
                <div className="text-xs" style={{ color: "var(--text-soft)" }}>
                  {items.length} course{items.length === 1 ? "" : "s"}
                </div>
              </div>
              <div className="space-y-3">
                {items.map((c) => (
                  <CourseCard key={c.id} course={c} />
                ))}
              </div>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}
