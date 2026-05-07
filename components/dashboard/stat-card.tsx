import { type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

type StatCardProps = {
  label: string;
  value: string;
  hint?: string;
  icon: LucideIcon;
  tone?: "orange" | "blue" | "green" | "navy";
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
}: StatCardProps) {
  return (
    <div className="border-border/70 bg-card relative overflow-hidden rounded-2xl border p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="eyebrow text-muted-foreground">{label}</p>
          <p className="font-display text-foreground mt-3 text-3xl font-medium tracking-tight tabular-nums">
            {value}
          </p>
          {hint ? (
            <p className="text-muted-foreground mt-1 text-xs">{hint}</p>
          ) : null}
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
