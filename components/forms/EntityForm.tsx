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
          const spanFull = f.type === "textarea" || f.type === "file";
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
              ) : f.type === "file" ? (
                <>
                  <input id={f.name} name={f.name} type="file" accept={f.accept} className="input" />
                  {stringValue && (
                    <p className="mt-1 text-xs" style={{ color: "var(--text-soft)" }}>
                      Current:{" "}
                      <a className="underline" href={stringValue} target="_blank" rel="noreferrer">
                        {stringValue}
                      </a>{" "}
                      (upload a new file to replace)
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
