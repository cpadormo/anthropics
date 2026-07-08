import { prisma } from "@/lib/db/client";
import { PageHeader } from "@/components/layout/PageHeader";
import { EmptyState } from "@/components/ui/EmptyState";
import { BookMarked, Star } from "lucide-react";

export default async function ReadingPage() {
  const items = await prisma.book.findMany({ orderBy: { dateRead: "desc" } });

  return (
    <div>
      <PageHeader title="Reading Log" description="Books read across psychology, law, criminology, and behavioral economics." />

      {items.length === 0 ? (
        <EmptyState icon={<BookMarked className="h-8 w-8 opacity-40" />} title="No books logged yet" addHref="/admin/book/new" />
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {items.map((b) => (
            <article key={b.id} className="card p-5">
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <h2 className="text-base font-semibold">{b.title}</h2>
                <div className="flex items-center gap-0.5">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className="h-3.5 w-3.5"
                      style={{ color: i < b.rating ? "#eab308" : "var(--border)" }}
                      fill={i < b.rating ? "#eab308" : "none"}
                    />
                  ))}
                </div>
              </div>
              <div className="mt-1 text-xs" style={{ color: "var(--text-soft)" }}>
                {b.author} · {b.category} · {b.dateRead}
              </div>
              <p className="mt-3 text-sm">{b.notes}</p>
              <div className="label mt-3">Takeaway</div>
              <p className="text-sm">{b.takeaways}</p>
              {b.favoriteQuote && (
                <blockquote className="mt-3 border-l-2 pl-3 text-sm italic" style={{ borderColor: "var(--accent)", color: "var(--text-soft)" }}>
                  &ldquo;{b.favoriteQuote}&rdquo;
                </blockquote>
              )}
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
