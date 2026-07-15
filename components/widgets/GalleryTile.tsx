"use client";

import { useEffect, useState } from "react";
import { FileText, X } from "lucide-react";

type Item = {
  id: string;
  title: string;
  caption: string | null;
  imageUrl: string;
};

function isPdf(url: string) {
  return url.startsWith("data:application/pdf") || /\.pdf(\?|$)/i.test(url);
}

export function GalleryTile({ item }: { item: Item }) {
  const [open, setOpen] = useState(false);
  const pdf = isPdf(item.imageUrl);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open]);

  if (pdf) {
    return (
      <figure className="card overflow-hidden">
        <a
          href={item.imageUrl}
          download={`${item.title || "attachment"}.pdf`}
          target="_blank"
          rel="noreferrer"
          className="flex aspect-[4/3] w-full flex-col items-center justify-center gap-2"
          style={{ background: "var(--accent-soft)", color: "var(--accent)" }}
        >
          <FileText className="h-10 w-10" />
          <span className="text-xs font-semibold">Open PDF</span>
        </a>
        <figcaption className="p-3 text-xs">
          <div className="font-medium">{item.title}</div>
          {item.caption && (
            <div style={{ color: "var(--text-soft)" }}>{item.caption}</div>
          )}
        </figcaption>
      </figure>
    );
  }

  return (
    <>
      <figure className="card overflow-hidden">
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="block aspect-[4/3] w-full cursor-zoom-in overflow-hidden"
          aria-label={`Enlarge ${item.title}`}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={item.imageUrl} alt={item.title} className="h-full w-full object-cover transition-transform hover:scale-105" />
        </button>
        <figcaption className="p-3 text-xs">
          <div className="font-medium">{item.title}</div>
          {item.caption && (
            <div style={{ color: "var(--text-soft)" }}>{item.caption}</div>
          )}
        </figcaption>
      </figure>

      {open && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={item.title}
          className="fixed inset-0 z-50 flex flex-col items-center justify-center gap-4 p-4 sm:p-8"
          style={{ background: "rgba(0, 0, 0, 0.92)" }}
          onClick={() => setOpen(false)}
        >
          <button
            type="button"
            onClick={() => setOpen(false)}
            aria-label="Close"
            className="absolute right-4 top-4 rounded-full p-2 text-white transition hover:bg-white/15"
          >
            <X className="h-6 w-6" />
          </button>

          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={item.imageUrl}
            alt={item.title}
            className="max-h-[80vh] max-w-full rounded-lg object-contain shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          />

          <figcaption
            className="max-w-2xl text-center text-white"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="text-base font-semibold">{item.title}</div>
            {item.caption && (
              <div className="mt-1 text-sm text-white/75">{item.caption}</div>
            )}
          </figcaption>
        </div>
      )}
    </>
  );
}
