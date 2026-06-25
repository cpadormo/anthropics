import type { HTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils";

interface Props extends HTMLAttributes<HTMLDivElement> {
  title?: string;
  subtitle?: ReactNode;
  actions?: ReactNode;
}

export function GlassCard({
  title,
  subtitle,
  actions,
  className,
  children,
  ...rest
}: Props) {
  return (
    <div
      className={cn(
        "relative h-full rounded-2xl border border-white/5 bg-bg-panel/70 backdrop-blur-xl shadow-glass",
        "flex flex-col overflow-hidden",
        className,
      )}
      {...rest}
    >
      {(title || actions) && (
        <div className="flex items-center justify-between gap-2 px-4 pt-3 pb-2 border-b border-white/5">
          <div className="min-w-0">
            {title && (
              <div className="text-2xs uppercase tracking-[0.14em] text-text-muted font-medium">
                {title}
              </div>
            )}
            {subtitle && <div className="text-sm text-text-secondary truncate">{subtitle}</div>}
          </div>
          {actions && <div className="flex items-center gap-1.5">{actions}</div>}
        </div>
      )}
      <div className="flex-1 min-h-0 overflow-auto p-3">{children}</div>
    </div>
  );
}
