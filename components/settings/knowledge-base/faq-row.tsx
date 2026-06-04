"use client";

import * as React from "react";
import { Loader2, Trash2 } from "lucide-react";
import { toast } from "sonner";
import type { FaqEntry } from "@/lib/api/faq";
import {
  deleteFaqAction,
  updateFaqAction,
} from "@/lib/api/faq-actions";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

type FaqRowProps = {
  entry: FaqEntry;
  onChange: (entry: FaqEntry) => void;
  onRemove: (id: string) => void;
};

export function FaqRow({ entry, onChange, onRemove }: FaqRowProps) {
  const [answer, setAnswer] = React.useState(entry.answer);
  const [active, setActive] = React.useState(entry.active);
  const [pending, startTransition] = React.useTransition();

  const dirty = answer !== entry.answer || active !== entry.active;

  function save() {
    startTransition(async () => {
      const result = await updateFaqAction(entry.id, { answer, active });
      if (!result.ok) {
        toast.error(result.error);
        return;
      }
      onChange(result.data);
      toast.success("Saved");
    });
  }

  function remove() {
    startTransition(async () => {
      const result = await deleteFaqAction(entry.id);
      if (!result.ok) {
        toast.error(result.error);
        return;
      }
      onRemove(entry.id);
    });
  }

  function toggleActive() {
    const next = !active;
    setActive(next);
    // Toggle persists immediately — toggling without saving the answer below
    // would be confusing ("did I turn it on or not?").
    startTransition(async () => {
      const result = await updateFaqAction(entry.id, { active: next });
      if (!result.ok) {
        toast.error(result.error);
        setActive(!next);
        return;
      }
      onChange(result.data);
    });
  }

  return (
    <div
      className={cn(
        "rounded-2xl border p-4 transition-colors",
        active
          ? "border-brand-green/30 bg-brand-green-soft/50"
          : "border-border/70 bg-muted/30",
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <p className="text-foreground text-sm font-medium">{entry.question}</p>
        <div className="flex shrink-0 items-center gap-2">
          <button
            type="button"
            role="switch"
            aria-checked={active}
            aria-label={active ? "Turn FAQ off" : "Turn FAQ on"}
            onClick={toggleActive}
            disabled={pending}
            className={cn(
              "relative h-5 w-9 shrink-0 rounded-full transition-colors",
              active ? "bg-brand-green" : "bg-muted",
              pending && "opacity-60",
            )}
          >
            <span
              className={cn(
                "absolute top-0.5 left-0.5 size-4 rounded-full bg-white shadow-sm transition-transform",
                active && "translate-x-4",
              )}
            />
          </button>
          <button
            type="button"
            onClick={remove}
            disabled={pending}
            aria-label="Delete FAQ"
            className="text-muted-foreground hover:text-destructive rounded-md p-1 transition-colors disabled:opacity-60"
          >
            <Trash2 className="size-4" strokeWidth={1.75} />
          </button>
        </div>
      </div>

      <textarea
        value={answer}
        onChange={(e) => setAnswer(e.target.value)}
        rows={3}
        placeholder="Answer the customer would see…"
        className="border-input bg-background hover:bg-muted/50 focus-visible:border-ring focus-visible:ring-ring/40 placeholder:text-muted-foreground mt-3 min-h-[72px] w-full resize-y rounded-md border px-3 py-2 text-sm transition-colors focus-visible:ring-2 focus-visible:outline-none"
      />

      <div className="mt-3 flex items-center justify-between gap-3">
        <p className="text-muted-foreground text-xs">
          {active
            ? "Live. Acroma uses this answer with customers."
            : "Off. Saved but not used until you turn it on."}
        </p>
        <Button
          type="button"
          onClick={save}
          disabled={!dirty || pending}
          variant="secondary"
          className="h-8 gap-2 rounded-lg px-3 text-xs"
        >
          {pending ? <Loader2 className="size-3 animate-spin" /> : null}
          Save
        </Button>
      </div>
    </div>
  );
}
