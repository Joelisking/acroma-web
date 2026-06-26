import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export type PillTone = "orange" | "blue" | "green" | "navy" | "muted" | "destructive";

const tones: Record<PillTone, string> = {
  orange: "bg-brand-orange-soft text-brand-orange",
  blue: "bg-brand-blue-soft text-brand-blue",
  green: "bg-brand-green-soft text-brand-green",
  navy: "bg-secondary/10 text-secondary",
  muted: "bg-muted text-muted-foreground",
  destructive: "bg-destructive/10 text-destructive",
};

/**
 * A small coloured status chip. The one way to render state (order status,
 * conversation status, paid/pending) so colour language stays consistent.
 */
export function StatusPill({
  tone = "muted",
  children,
  className,
}: {
  tone?: PillTone;
  children: ReactNode;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[0.7rem] font-semibold whitespace-nowrap",
        tones[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}
