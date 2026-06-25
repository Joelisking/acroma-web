import type { ComponentType, ReactNode } from "react";
import { cn } from "@/lib/utils";

/**
 * The dashboard's single empty-state primitive. Teaches the screen rather than
 * saying "nothing here": a soft brand icon tile, a plain title, a one-line
 * explanation, and (optionally) the single obvious next action. Used for empty
 * lists, filtered-to-nothing states, and first-run surfaces.
 */
export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  tone = "brand",
  className,
}: {
  icon: ComponentType<{ className?: string; strokeWidth?: number }>;
  title: ReactNode;
  description?: ReactNode;
  action?: ReactNode;
  /** Icon tile colour. `brand` (orange) for first-run, `muted` for filtered. */
  tone?: "brand" | "muted";
  className?: string;
}) {
  return (
    <div
      className={cn(
        "border-border/70 bg-card/60 flex flex-col items-center justify-center rounded-2xl border border-dashed px-6 py-16 text-center",
        className,
      )}
    >
      <span
        className={cn(
          "flex size-14 items-center justify-center rounded-2xl",
          tone === "brand"
            ? "bg-brand-orange-soft text-brand-orange"
            : "bg-muted text-muted-foreground",
        )}
      >
        <Icon className="size-6" strokeWidth={1.75} />
      </span>
      <p className="text-foreground mt-5 text-lg font-semibold tracking-tight">
        {title}
      </p>
      {description ? (
        <p className="text-muted-foreground mt-1.5 max-w-sm text-sm leading-relaxed">
          {description}
        </p>
      ) : null}
      {action ? <div className="mt-5">{action}</div> : null}
    </div>
  );
}
