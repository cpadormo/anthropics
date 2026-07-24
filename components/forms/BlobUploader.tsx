"use client";

import { useState } from "react";
import { upload } from "@vercel/blob/client";

export function BlobUploader({
  name,
  accept,
  currentValue,
  required,
}: {
  name: string;
  accept: string;
  currentValue?: string;
  required?: boolean;
}) {
  const [url, setUrl] = useState(currentValue ?? "");
  const [status, setStatus] = useState<"idle" | "uploading" | "done" | "error">(
    currentValue ? "done" : "idle",
  );
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState("");
  const [fileName, setFileName] = useState("");

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setFileName(file.name);
    setStatus("uploading");
    setProgress(0);
    setError("");
    try {
      const blob = await upload(file.name, file, {
        access: "public",
        handleUploadUrl: "/api/upload",
        onUploadProgress: (event) => setProgress(Math.round(event.percentage)),
      });
      setUrl(blob.url);
      setStatus("done");
    } catch (err) {
      const message = (err as Error).message || "Upload failed.";
      setError(
        message.includes("BLOB_READ_WRITE_TOKEN") || message.includes("Vercel Blob")
          ? "Vercel Blob isn't set up yet. Open your Vercel project → Storage tab → Create a Blob store. Free tier is fine."
          : message,
      );
      setStatus("error");
    }
  };

  return (
    <div className="space-y-2">
      <input type="hidden" name={name} value={url} />
      <input
        type="file"
        accept={accept}
        onChange={handleFile}
        disabled={status === "uploading"}
        required={required && !url}
        className="input file:mr-3 file:rounded-md file:border-0 file:bg-[color:var(--accent-soft)] file:px-3 file:py-1 file:text-sm file:font-medium file:text-[color:var(--text)] hover:file:cursor-pointer"
      />

      {status === "uploading" && (
        <div className="space-y-1">
          <p className="text-xs" style={{ color: "var(--text-soft)" }}>
            Uploading {fileName} — {progress}%
          </p>
          <div className="h-1.5 w-full overflow-hidden rounded-full" style={{ background: "var(--accent-soft)" }}>
            <div
              className="h-full rounded-full transition-all"
              style={{ width: `${progress}%`, background: "var(--accent)" }}
            />
          </div>
        </div>
      )}

      {status === "done" && url && (
        <p className="text-xs" style={{ color: "var(--text-soft)" }}>
          ✓ File attached. Choose a new one to replace it, or leave blank to keep this.
        </p>
      )}

      {status === "error" && (
        <p className="text-xs" style={{ color: "#dc2626" }}>
          {error}
        </p>
      )}
    </div>
  );
}
