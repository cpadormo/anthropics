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
  Summer: 2,
  Spring: 3,
  Winter: 4,
};

const SEMESTER_MONTH: Record<string, number> = {
  Winter: 1,
  Spring: 3,
  Summer: 6,
  Fall: 9,
};

export function dateStringToScore(input: string | null | undefined): number {
  if (!input) return 0;
  const str = input.trim();
  if (!str) return 0;
  const semMatch = str.match(/\b(Fall|Spring|Summer|Winter)\s+(\d{4})\b/i);
  if (semMatch) {
    const sem = semMatch[1].charAt(0).toUpperCase() + semMatch[1].slice(1).toLowerCase();
    const year = Number(semMatch[2]);
    const month = SEMESTER_MONTH[sem] ?? 6;
    return year * 12 + month;
  }
  const parsed = new Date(str);
  if (!Number.isNaN(parsed.getTime())) {
    return parsed.getFullYear() * 12 + (parsed.getMonth() + 1);
  }
  const yearOnly = str.match(/\b(\d{4})\b/);
  if (yearOnly) {
    return Number(yearOnly[1]) * 12 + 6;
  }
  return 0;
}

export function semesterRank(sem: string | null | undefined): number {
  if (!sem) return 99;
  return SEMESTER_ORDER[sem.trim()] ?? 99;
}

export function compareCoursesRecent<T extends { year: number; semester: string }>(a: T, b: T) {
  const yearDiff = b.year - a.year;
  if (yearDiff !== 0) return yearDiff;
  return semesterRank(a.semester) - semesterRank(b.semester);
}
