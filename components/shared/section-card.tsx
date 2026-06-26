import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type SectionCardProps = {
  title?: ReactNode;
  /** Right-aligned slot in the header row (a link, button, filter). */
  action?: ReactNode;
  children: ReactNode;
  className?: string;
  /** Override the body padding (e.g. `p-0` for flush list rows). */
  bodyClassName?: string;
};

/**
 * The default Soft Stack content surface: a warm-white rounded panel with an
 * optional heading row. Compose pages from these instead of bespoke card markup
 * so every panel shares one radius, shadow, and header rhythm.
 */
export function SectionCard({
  title,
  action,
  children,
  className,
  bodyClassName,
}: SectionCardProps) {
  return (
    <section className={cn("card-warm overflow-hidden", className)}>
      {title || action ? (
        <header className="flex items-center justify-between gap-3 px-4 pt-4 sm:px-5">
          {title ? (
            <h2 className="text-foreground text-sm font-bold tracking-tight">
              {title}
            </h2>
          ) : (
            <span />
          )}
          {action}
        </header>
      ) : null}
      <div className={cn("p-4 sm:p-5", bodyClassName)}>{children}</div>
    </section>
  );
}
