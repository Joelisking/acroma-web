import { Check, Plug } from "lucide-react";
import { cn } from "@/lib/utils";

export function WhatsappStatus({ active }: { active: boolean }) {
  return (
    <div
      className={cn(
        "flex items-center gap-3 rounded-2xl border p-4",
        active
          ? "border-brand-green/25 bg-brand-green-soft"
          : "border-border/70 bg-muted/40",
      )}
    >
      <span
        className={cn(
          "flex size-9 items-center justify-center rounded-xl",
          active
            ? "bg-brand-green/15 text-brand-green"
            : "bg-background text-muted-foreground",
        )}
      >
        {active ? (
          <Check className="size-5" strokeWidth={2.5} />
        ) : (
          <Plug className="size-5" strokeWidth={1.75} />
        )}
      </span>
      <div>
        <p
          className={cn(
            "text-sm font-medium",
            active ? "text-brand-green" : "text-foreground",
          )}
        >
          {active ? "Connected and live" : "Not yet connected"}
        </p>
        <p
          className={cn(
            "text-xs",
            active ? "text-brand-navy/70" : "text-muted-foreground",
          )}
        >
          {active
            ? "Acroma is replying to messages on your WhatsApp number."
            : "Add your credentials below to bring Acroma online."}
        </p>
      </div>
    </div>
  );
}
