import { cn } from "@/lib/utils";

type StatChipProps = {
  label: string;
  value: string;
  hint?: string;
  /** Dim the value while a re-fetch is in flight. */
  loading?: boolean;
  className?: string;
};

/**
 * Soft Stack metric chip: a compact warm-white card with a muted label and a
 * bold tabular value. The default way to show a single number (revenue, orders,
 * counts) in a tight row. For a metric that needs an icon/delta, see StatCard.
 */
export function StatChip({ label, value, hint, loading, className }: StatChipProps) {
  return (
    <div className={cn("card-warm p-4", className)}>
      <p className="text-muted-foreground text-xs font-medium">{label}</p>
      <p
        className={cn(
          "text-foreground mt-1.5 text-xl font-bold tracking-tight tabular-nums transition-opacity sm:text-2xl",
          loading && "opacity-40",
        )}
      >
        {value}
      </p>
      {hint ? <p className="text-muted-foreground mt-1 text-xs">{hint}</p> : null}
    </div>
  );
}
