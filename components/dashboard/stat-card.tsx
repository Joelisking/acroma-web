import { type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

type StatCardProps = {
  label: string;
  value: string;
  hint?: string;
  icon: LucideIcon;
  tone?: "orange" | "blue" | "green" | "navy";
  /** Optional compare-to-previous delta. Percent number or null. */
  delta?: { change: number | null; label: string };
  /** Dim the value while a re-fetch is in flight. */
  loading?: boolean;
};

const toneStyles: Record<NonNullable<StatCardProps["tone"]>, string> = {
  orange: "bg-brand-orange-soft text-brand-orange",
  blue: "bg-brand-blue-soft text-brand-blue",
  green: "bg-brand-green-soft text-brand-green",
  navy: "bg-secondary/8 text-secondary",
};

export function StatCard({
  label,
  value,
  hint,
  icon: Icon,
  tone = "orange",
  delta,
  loading = false,
}: StatCardProps) {
  return (
    <div className="card-warm relative overflow-hidden p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-muted-foreground text-xs font-medium">{label}</p>
          <p
            className={cn(
              "text-foreground mt-2.5 text-3xl font-semibold tracking-tight tabular-nums transition-opacity",
              loading && "opacity-40",
            )}
          >
            {value}
          </p>
          {hint ? (
            <p className="text-muted-foreground mt-1 text-xs">{hint}</p>
          ) : null}
          {delta ? <DeltaLine delta={delta} /> : null}
        </div>
        <span
          className={cn(
            "flex size-10 shrink-0 items-center justify-center rounded-xl",
            toneStyles[tone],
          )}
        >
          <Icon className="size-5" strokeWidth={1.75} />
        </span>
      </div>
    </div>
  );
}

function DeltaLine({
  delta,
}: {
  delta: NonNullable<StatCardProps["delta"]>;
}) {
  const { change, label } = delta;
  const tone =
    change === null
      ? "text-muted-foreground"
      : change > 0
        ? "text-brand-green"
        : change < 0
          ? "text-destructive"
          : "text-muted-foreground";
  return <p className={cn("mt-1 text-xs font-medium", tone)}>{label}</p>;
}
