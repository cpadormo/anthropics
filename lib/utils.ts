import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function parseJsonArray(value: string | null | undefined): string[] {
  if (!value) return [];
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed.map(String) : [];
  } catch {
    return [];
  }
}

export function splitLines(value: string | null | undefined): string[] {
  if (!value) return [];
  return value
    .split(/\r?\n|;|•/g)
    .map((s) => s.trim())
    .filter(Boolean);
}

export function formatDateRange(start: string | null | undefined, end: string | null | undefined) {
  const s = (start ?? "").trim();
  const e = (end ?? "").trim();
  if (!s && !e) return "";
  if (!e) return `${s} – Present`;
  return `${s} – ${e}`;
}

export const SEMESTER_ORDER: Record<string, number> = {
  Fall: 1,
  Spring: 2,
  Summer: 3,
  Winter: 4,
};

export function semesterRank(sem: string | null | undefined): number {
  if (!sem) return 99;
  return SEMESTER_ORDER[sem.trim()] ?? 99;
}

export function compareCoursesRecent<T extends { year: number; semester: string }>(a: T, b: T) {
  const yearDiff = b.year - a.year;
  if (yearDiff !== 0) return yearDiff;
  return semesterRank(a.semester) - semesterRank(b.semester);
}
