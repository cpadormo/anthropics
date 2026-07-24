"use client";

import { useFormStatus } from "react-dom";
import type { EntityConfig } from "@/lib/entities";
import { BlobUploader } from "./BlobUploader";

export function EntityForm({
  entity,
  initial,
  action,
}: {
  entity: EntityConfig;
  initial?: Record<string, unknown> | null;
  action: (formData: FormData) => Promise<void>;
}) {
  return (
    <form action={action} encType="multipart/form-data" className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2">
        {entity.fields.map((f) => {
          const value = initial?.[f.name];
          const stringValue = value == null ? "" : String(value);
          const spanFull = f.type === "textarea" || f.type === "pdf" || f.type === "media" || f.type === "video";
          return (
            <div key={f.name} className={spanFull ? "md:col-span-2" : undefined}>
              <label className="label" htmlFor={f.name}>
                {f.label}
                {f.required && <span style={{ color: "#dc2626" }}> *</span>}
              </label>
              {f.type === "textarea" ? (
                <textarea
                  id={f.name}
                  name={f.name}
                  required={f.required}
                  defaultValue={stringValue}
                  placeholder={f.placeholder}
                  rows={5}
                  className="input"
                />
              ) : f.type === "select" ? (
                <select id={f.name} name={f.name} required={f.required} defaultValue={stringValue} className="input">
                  <option value="">Select…</option>
                  {f.options?.map((o) => (
                    <option key={o} value={o}>
                      {o}
                    </option>
                  ))}
                </select>
              ) : f.type === "pdf" ? (
                <BlobUploader name={f.name} accept="application/pdf" currentValue={stringValue} required={f.required} />
              ) : f.type === "media" ? (
                <BlobUploader name={f.name} accept="image/*,application/pdf" currentValue={stringValue} required={f.required} />
              ) : f.type === "video" ? (
                <BlobUploader name={f.name} accept="video/*,.mov,.mp4,.webm,.m4v" currentValue={stringValue} required={f.required} />
              ) : (
                <input
                  id={f.name}
                  name={f.name}
                  type={f.type === "number" ? "number" : f.type === "url" ? "url" : "text"}
                  step={f.type === "number" ? "any" : undefined}
                  required={f.required}
                  defaultValue={stringValue}
                  placeholder={f.placeholder}
                  className="input"
                />
              )}
              {f.help && (
                <p className="mt-1 text-xs" style={{ color: "var(--text-soft)" }}>
                  {f.help}
                </p>
              )}
            </div>
          );
        })}
      </div>

      <div className="flex items-center gap-3 pt-2">
        <SubmitButton />
      </div>
    </form>
  );
}

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" className="btn-primary" disabled={pending}>
      {pending ? "Saving…" : "Save"}
    </button>
  );
}
