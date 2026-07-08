import { prisma } from "@/lib/db/client";
import { PageHeader } from "@/components/layout/PageHeader";
import { EmptyState } from "@/components/ui/EmptyState";
import { ImageIcon } from "lucide-react";

export default async function GalleryPage() {
  const items = await prisma.galleryItem.findMany({ orderBy: { date: "desc" } });
  const grouped = items.reduce<Record<string, typeof items>>((acc, g) => {
    acc[g.category] = acc[g.category] ?? [];
    acc[g.category].push(g);
    return acc;
  }, {});

  return (
    <div>
      <PageHeader title="Media Gallery" description="Lab, presentation, activity, and campus photos." />
      {items.length === 0 ? (
        <EmptyState
          icon={<ImageIcon className="h-8 w-8 opacity-40" />}
          title="No photos yet"
          hint="Upload images via the admin panel to populate this gallery."
          addHref="/admin/gallery/new"
        />
      ) : (
        <div className="space-y-8">
          {Object.entries(grouped).map(([cat, list]) => (
            <section key={cat}>
              <h2 className="mb-3 text-base font-semibold">{cat}</h2>
              <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4">
                {list.map((g) => (
                  <figure key={g.id} className="card overflow-hidden">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={g.imageUrl} alt={g.title} className="aspect-[4/3] w-full object-cover" />
                    <figcaption className="p-3 text-xs">
                      <div className="font-medium">{g.title}</div>
                      {g.caption && (
                        <div style={{ color: "var(--text-soft)" }}>{g.caption}</div>
                      )}
                    </figcaption>
                  </figure>
                ))}
              </div>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}
