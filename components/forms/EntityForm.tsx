"use client";

import { useFormStatus } from "react-dom";
import type { EntityConfig } from "@/lib/entities";

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
                <>
                  <input
                    id={f.name}
                    name={f.name}
                    type="file"
                    accept="application/pdf"
                    className="input file:mr-3 file:rounded-md file:border-0 file:bg-[color:var(--accent-soft)] file:px-3 file:py-1 file:text-sm file:font-medium file:text-[color:var(--text)] hover:file:cursor-pointer"
                  />
                  {stringValue && (
                    <p className="mt-1 text-xs" style={{ color: "var(--text-soft)" }}>
                      ✓ PDF already attached. Choose a new file to replace it, or leave blank to keep the current one.
                    </p>
                  )}
                </>
              ) : f.type === "media" ? (
                <>
                  <input
                    id={f.name}
                    name={f.name}
                    type="file"
                    accept="image/*,application/pdf"
                    className="input file:mr-3 file:rounded-md file:border-0 file:bg-[color:var(--accent-soft)] file:px-3 file:py-1 file:text-sm file:font-medium file:text-[color:var(--text)] hover:file:cursor-pointer"
                  />
                  {stringValue && (
                    <p className="mt-1 text-xs" style={{ color: "var(--text-soft)" }}>
                      ✓ File already attached. Choose a new one to replace it, or leave blank to keep the current one.
                    </p>
                  )}
                </>
              ) : f.type === "video" ? (
                <>
                  <input
                    id={f.name}
                    name={f.name}
                    type="file"
                    accept="video/*,.mov,.mp4,.webm,.m4v"
                    className="input file:mr-3 file:rounded-md file:border-0 file:bg-[color:var(--accent-soft)] file:px-3 file:py-1 file:text-sm file:font-medium file:text-[color:var(--text)] hover:file:cursor-pointer"
                  />
                  {stringValue && (
                    <p className="mt-1 text-xs" style={{ color: "var(--text-soft)" }}>
                      ✓ Video already attached. Choose a new file to replace it, or leave blank to keep the current one.
                    </p>
                  )}
                </>
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
