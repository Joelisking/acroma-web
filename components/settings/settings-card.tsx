import { cn } from "@/lib/utils";

type SettingsCardProps = {
  title: string;
  description?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  className?: string;
};

/**
 * Standard container for a single settings group.
 * Used inside settings sub-pages to keep visual rhythm consistent.
 */
export function SettingsCard({
  title,
  description,
  children,
  footer,
  className,
}: SettingsCardProps) {
  return (
    <section
      className={cn(
        "border-border/70 bg-card overflow-hidden rounded-2xl border",
        className,
      )}
    >
      <div className="space-y-1 px-6 pt-6">
        <h2 className="text-foreground text-xl font-semibold tracking-tight">
          {title}
        </h2>
        {description ? (
          <p className="text-muted-foreground text-sm leading-relaxed">
            {description}
          </p>
        ) : null}
      </div>
      <div className="space-y-5 px-6 pt-5 pb-6">{children}</div>
      {footer ? (
        <div className="border-border/70 bg-muted/40 flex items-center justify-end gap-3 border-t px-6 py-4">
          {footer}
        </div>
      ) : null}
    </section>
  );
}
