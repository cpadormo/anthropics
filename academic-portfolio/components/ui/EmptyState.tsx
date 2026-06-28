import Link from "next/link";
import type { ReactNode } from "react";

export function EmptyState({
  title,
  hint,
  addHref,
  icon,
}: {
  title: string;
  hint?: string;
  addHref?: string;
  icon?: ReactNode;
}) {
  return (
    <div className="card flex flex-col items-center justify-center py-12 text-center">
      {icon}
      <h3 className="mt-3 text-base font-semibold">{title}</h3>
      {hint && (
        <p className="mt-1 max-w-md text-sm" style={{ color: "var(--text-soft)" }}>
          {hint}
        </p>
      )}
      {addHref && (
        <Link href={addHref} className="btn-primary mt-4">
          Add entry
        </Link>
      )}
    </div>
  );
}
