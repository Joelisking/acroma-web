"use client";

import { cn } from "@/lib/utils";

export type Segment = { value: string; label: string; count?: number };

type SegmentedControlProps = {
  segments: Segment[];
  value: string;
  onValueChange: (value: string) => void;
  className?: string;
  "aria-label"?: string;
};

/**
 * Pill segmented control for filters and view switches (All / Needs you /
 * Resolved, etc.). Promotes the old `.seg` CSS into one accessible component:
 * the active segment lifts onto a white surface; an optional count sits inline.
 */
export function SegmentedControl({
  segments,
  value,
  onValueChange,
  className,
  "aria-label": ariaLabel,
}: SegmentedControlProps) {
  return (
    <div
      role="tablist"
      aria-label={ariaLabel}
      className={cn("bg-muted inline-flex max-w-full gap-1 overflow-x-auto rounded-full p-1", className)}
    >
      {segments.map((segment) => {
        const active = segment.value === value;
        return (
          <button
            key={segment.value}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => onValueChange(segment.value)}
            className={cn(
              "rounded-full px-3 py-1.5 text-xs font-semibold whitespace-nowrap transition-colors",
              active
                ? "bg-card text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            {segment.label}
            {typeof segment.count === "number" ? (
              <span className="ml-1.5 tabular-nums opacity-70">{segment.count}</span>
            ) : null}
          </button>
        );
      })}
    </div>
  );
}
