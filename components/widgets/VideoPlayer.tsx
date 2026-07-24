"use client";

import { useEffect, useState } from "react";
import { Maximize2, X } from "lucide-react";

export function VideoPlayer({ src, title }: { src: string; title?: string }) {
  const [open, setOpen] = useState(false);

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

  return (
    <>
      <div className="relative mt-4 overflow-hidden rounded-lg border" style={{ borderColor: "var(--border)" }}>
        <video src={src} controls playsInline preload="metadata" className="w-full" />
        <button
          type="button"
          onClick={() => setOpen(true)}
          aria-label="Enlarge video"
          className="absolute right-2 top-2 rounded-full p-2 text-white transition"
          style={{ background: "rgba(0,0,0,0.55)" }}
        >
          <Maximize2 className="h-4 w-4" />
        </button>
      </div>

      {open && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={title}
          className="fixed inset-0 z-50 flex flex-col items-center justify-center gap-4 p-4 sm:p-8"
          style={{ background: "rgba(0, 0, 0, 0.94)" }}
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

          <video
            src={src}
            controls
            autoPlay
            playsInline
            className="max-h-[85vh] max-w-full rounded-lg shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          />

          {title && (
            <div className="text-center text-sm font-semibold text-white" onClick={(e) => e.stopPropagation()}>
              {title}
            </div>
          )}
        </div>
      )}
    </>
  );
}
