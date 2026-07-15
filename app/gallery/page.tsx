import { prisma } from "@/lib/db/client";
import { PageHeader } from "@/components/layout/PageHeader";
import { EmptyState } from "@/components/ui/EmptyState";
import { ImageIcon } from "lucide-react";
import { GalleryTile } from "@/components/widgets/GalleryTile";

export default async function GalleryPage() {
  const items = await prisma.galleryItem.findMany({ orderBy: { date: "desc" } });
  const grouped = items.reduce<Record<string, typeof items>>((acc, g) => {
    acc[g.category] = acc[g.category] ?? [];
    acc[g.category].push(g);
    return acc;
  }, {});

  return (
    <div>
      <PageHeader
        title="Media Gallery"
        description="Photos and PDFs from internships, labs, presentations, activities, and campus. Tap a photo to enlarge it."
      />
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
                {list.map((g) => (
                  <GalleryTile key={g.id} item={g} />
                ))}
              </div>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}
