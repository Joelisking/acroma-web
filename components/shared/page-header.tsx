import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/**
 * The one page header for the dashboard. Calm operating-tool register: a clean
 * Geist title (no serif, no per-page eyebrow), an optional one-line
 * description, and an actions slot that drops below the title on mobile and
 * sits inline from `sm` up. Use on every dashboard page so headers never drift.
 */
export function PageHeader({
  title,
  description,
  actions,
  className,
}: {
  title: ReactNode;
  description?: ReactNode;
  actions?: ReactNode;
  className?: string;
}) {
  return (
    <header
      className={cn(
        "flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between",
        className,
      )}
    >
      <div className="min-w-0">
        <h1 className="text-foreground text-2xl font-semibold tracking-tight text-balance sm:text-3xl">
          {title}
        </h1>
        {description ? (
          <p className="text-muted-foreground mt-1 text-sm">{description}</p>
        ) : null}
      </div>
      {actions ? (
        <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div>
      ) : null}
    </header>
  );
}
