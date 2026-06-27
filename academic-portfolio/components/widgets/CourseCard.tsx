"use client";

import { useState } from "react";
import { ChevronDown, FileText } from "lucide-react";
import { parseJsonArray, splitLines } from "@/lib/utils";

type Course = {
  id: string;
  code: string;
  title: string;
  semester: string;
  year: number;
  credits: number;
  instructor: string;
  description: string;
  topics: string;
  projects: string;
  papers: string;
  finalGrade: string | null;
  reflection: string;
  category: string;
  syllabusUrl: string | null;
  attachments: string;
};

export function CourseCard({ course }: { course: Course }) {
  const [open, setOpen] = useState(false);
  const attachments = parseJsonArray(course.attachments);
  const topics = splitLines(course.topics);
  const projects = splitLines(course.projects);
  const papers = splitLines(course.papers);

  return (
    <div className="card overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen((s) => !s)}
        className="flex w-full items-start justify-between gap-4 p-5 text-left"
      >
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-baseline gap-2">
            <span className="text-xs font-semibold tracking-wide" style={{ color: "var(--accent)" }}>
              {course.code}
            </span>
            <span className="badge">{course.category}</span>
            {course.finalGrade && <span className="badge">Grade · {course.finalGrade}</span>}
          </div>
          <h3 className="mt-1 text-lg font-semibold">{course.title}</h3>
          <div className="mt-1 text-xs" style={{ color: "var(--text-soft)" }}>
            {course.semester} {course.year} · {course.instructor} · {course.credits} credits
          </div>
        </div>
        <ChevronDown
          className="h-5 w-5 shrink-0 transition-transform"
          style={{ transform: open ? "rotate(180deg)" : "rotate(0)" }}
        />
      </button>

      {open && (
        <div className="space-y-5 border-t px-5 pb-5 pt-5" style={{ borderColor: "var(--border)" }}>
          <div>
            <div className="label">Course description</div>
            <p className="text-sm leading-relaxed">{course.description}</p>
          </div>

          {topics.length > 0 && (
            <Section title="Important topics learned">
              <ul className="flex flex-wrap gap-1.5">
                {topics.map((t) => (
                  <li key={t} className="badge">
                    {t}
                  </li>
                ))}
              </ul>
            </Section>
          )}

          {projects.length > 0 && (
            <Section title="Projects completed">
              <ul className="list-disc space-y-1 pl-5 text-sm">
                {projects.map((p) => (
                  <li key={p}>{p}</li>
                ))}
              </ul>
            </Section>
          )}

          {papers.length > 0 && (
            <Section title="Research papers written">
              <ul className="list-disc space-y-1 pl-5 text-sm">
                {papers.map((p) => (
                  <li key={p}>{p}</li>
                ))}
              </ul>
            </Section>
          )}

          {course.reflection && (
            <Section title="Reflection">
              <p className="text-sm italic leading-relaxed" style={{ color: "var(--text-soft)" }}>
                {course.reflection}
              </p>
            </Section>
          )}

          {(course.syllabusUrl || attachments.length > 0) && (
            <Section title="Attachments">
              <ul className="space-y-1.5">
                {course.syllabusUrl && (
                  <li>
                    <a className="inline-flex items-center gap-2 text-sm hover:underline" href={course.syllabusUrl} target="_blank" rel="noreferrer">
                      <FileText className="h-4 w-4" /> Syllabus
                    </a>
                  </li>
                )}
                {attachments.map((url) => (
                  <li key={url}>
                    <a className="inline-flex items-center gap-2 text-sm hover:underline" href={url} target="_blank" rel="noreferrer">
                      <FileText className="h-4 w-4" /> {url.split("/").pop()}
                    </a>
                  </li>
                ))}
              </ul>
            </Section>
          )}
        </div>
      )}
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="label">{title}</div>
      {children}
    </div>
  );
}
