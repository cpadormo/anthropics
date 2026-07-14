import { prisma } from "@/lib/db/client";
import { PageHeader } from "@/components/layout/PageHeader";
import { EmptyState } from "@/components/ui/EmptyState";
import { FileText, ImageIcon } from "lucide-react";

function isPdf(url: string | null | undefined) {
  if (!url) return false;
  return url.startsWith("data:application/pdf") || /\.pdf(\?|$)/i.test(url);
}

export default async function GalleryPage() {
  const items = await prisma.galleryItem.findMany({ orderBy: { date: "desc" } });
  const grouped = items.reduce<Record<string, typeof items>>((acc, g) => {
    acc[g.category] = acc[g.category] ?? [];
    acc[g.category].push(g);
    return acc;
  }, {});

  return (
    <div>
      <PageHeader title="Media Gallery" description="Lab, presentation, activity, and campus photos or PDFs." />
      {items.length === 0 ? (
        <EmptyState
          icon={<ImageIcon className="h-8 w-8 opacity-40" />}
          title="No files yet"
          hint="Upload a photo, screenshot, or PDF via the admin panel."
          addHref="/admin/gallery/new"
        />
      ) : (
        <div className="space-y-8">
          {Object.entries(grouped).map(([cat, list]) => (
            <section key={cat}>
              <h2 className="mb-3 text-base font-semibold">{cat}</h2>
              <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4">
                {list.map((g) => {
                  const pdf = isPdf(g.imageUrl);
                  return (
                    <figure key={g.id} className="card overflow-hidden">
                      {pdf ? (
                        <a
                          href={g.imageUrl}
                          download={`${g.title || "attachment"}.pdf`}
                          target="_blank"
                          rel="noreferrer"
                          className="flex aspect-[4/3] w-full flex-col items-center justify-center gap-2"
                          style={{ background: "var(--accent-soft)", color: "var(--accent)" }}
                        >
                          <FileText className="h-10 w-10" />
                          <span className="text-xs font-semibold">Open PDF</span>
                        </a>
                      ) : (
                        /* eslint-disable-next-line @next/next/no-img-element */
                        <img src={g.imageUrl} alt={g.title} className="aspect-[4/3] w-full object-cover" />
                      )}
                      <figcaption className="p-3 text-xs">
                        <div className="font-medium">{g.title}</div>
                        {g.caption && (
                          <div style={{ color: "var(--text-soft)" }}>{g.caption}</div>
                        )}
                      </figcaption>
                    </figure>
                  );
                })}
              </div>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}
