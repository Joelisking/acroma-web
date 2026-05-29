"use client";

import * as React from "react";
import { Sparkles } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { updateAiEnabledAction } from "@/lib/api/settings-actions";

type Props = {
  initialEnabled: boolean;
};

export function AiModeToggle({ initialEnabled }: Props) {
  const [enabled, setEnabled] = React.useState(initialEnabled);
  const [pending, startTransition] = React.useTransition();

  function toggle() {
    const next = !enabled;
    setEnabled(next);
    startTransition(async () => {
      const result = await updateAiEnabledAction(next);
      if (!result.ok) {
        setEnabled(!next);
        toast.error(result.error);
      }
    });
  }

  return (
    <button
      type="button"
      onClick={toggle}
      disabled={pending}
      aria-label={enabled ? "Turn AI off" : "Turn AI on"}
      className={cn(
        "flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors",
        "disabled:opacity-60",
        enabled
          ? "border-brand-orange/30 bg-brand-orange-soft text-brand-orange hover:bg-brand-orange/10"
          : "border-border bg-muted text-muted-foreground hover:bg-muted/80",
      )}
    >
      <span
        className={cn(
          "size-1.5 rounded-full",
          enabled ? "bg-brand-orange" : "bg-muted-foreground",
        )}
      />
      <Sparkles className="size-3" strokeWidth={2} />
      {enabled ? "AI on" : "AI off"}
    </button>
  );
}
