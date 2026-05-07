import { cn } from "@/lib/utils";

type ProgressProps = {
  /** 1-indexed current step. */
  current: number;
  total: number;
};

export function OnboardingProgress({ current, total }: ProgressProps) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <p className="eyebrow text-muted-foreground">
          Step {current} of {total}
        </p>
        <p className="text-muted-foreground text-xs tabular-nums">
          {Math.round((current / total) * 100)}%
        </p>
      </div>
      <div className="bg-muted relative h-1 w-full overflow-hidden rounded-full">
        <div
          className={cn(
            "bg-brand-orange absolute inset-y-0 left-0 rounded-full transition-[width] duration-500",
          )}
          style={{ width: `${(current / total) * 100}%` }}
        />
      </div>
    </div>
  );
}
