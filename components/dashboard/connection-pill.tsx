import { Check, Plug } from "lucide-react";
import { cn } from "@/lib/utils";

type ConnectionPillProps = {
  active: boolean;
  className?: string;
};

/**
 * WhatsApp connection status pill — soft chip with semantic color.
 */
export function ConnectionPill({ active, className }: ConnectionPillProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium",
        active
          ? "bg-brand-green-soft text-brand-green"
          : "bg-muted text-muted-foreground",
        className,
      )}
    >
      {active ? (
        <Check className="size-3" strokeWidth={2.5} />
      ) : (
        <Plug className="size-3" strokeWidth={2.25} />
      )}
      WhatsApp {active ? "connected" : "not connected"}
    </span>
  );
}
