"use client";

import * as React from "react";
import { Loader2, RotateCcw } from "lucide-react";
import { toast } from "sonner";
import type { FaqCategory, FaqEntry } from "@/lib/api/faq";
import { resetFaqToTemplateAction } from "@/lib/api/faq-actions";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { CATEGORY_ORDER } from "./categories";
import { CategoryGroup } from "./category-group";
import { AddFaqForm } from "./add-faq-form";

type KnowledgeBaseManagerProps = {
  initialEntries: FaqEntry[];
};

export function KnowledgeBaseManager({
  initialEntries,
}: KnowledgeBaseManagerProps) {
  const [entries, setEntries] = React.useState(initialEntries);
  const [resetting, startReset] = React.useTransition();

  function upsert(entry: FaqEntry) {
    setEntries((prev) => {
      const i = prev.findIndex((e) => e.id === entry.id);
      if (i === -1) return [...prev, entry];
      const next = [...prev];
      next[i] = entry;
      return next;
    });
  }

  function add(entry: FaqEntry) {
    setEntries((prev) => [...prev, entry]);
  }

  function remove(id: string) {
    setEntries((prev) => prev.filter((e) => e.id !== id));
  }

  function reset() {
    startReset(async () => {
      const result = await resetFaqToTemplateAction();
      if (!result.ok) {
        toast.error(result.error);
        return;
      }
      // Easiest correct refresh: full reload picks up the regenerated
      // server-side list without us re-implementing pagination here.
      toast.success("Reset complete");
      window.location.reload();
    });
  }

  const grouped = React.useMemo(() => {
    const map: Record<FaqCategory, FaqEntry[]> = {
      DELIVERY: [],
      PAYMENT: [],
      HOURS: [],
      LOCATION: [],
      RETURNS: [],
      WHOLESALE: [],
      OTHER: [],
    };
    for (const e of entries) map[e.category].push(e);
    for (const c of CATEGORY_ORDER) {
      map[c].sort((a, b) => a.order - b.order || a.question.localeCompare(b.question));
    }
    return map;
  }, [entries]);

  const totalActive = entries.filter((e) => e.active).length;

  return (
    <div className="space-y-6">
      <div className="border-brand-blue/20 bg-brand-blue-soft text-brand-navy/80 flex flex-wrap items-center justify-between gap-3 rounded-2xl border p-4 text-sm">
        <p>
          <span className="text-brand-blue font-semibold">{totalActive}</span>{" "}
          of {entries.length} answers are live. Acroma only uses the ones that
          are switched on.
        </p>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button
              type="button"
              variant="ghost"
              disabled={resetting}
              className="text-brand-navy hover:bg-brand-blue/10 h-8 gap-1.5 rounded-lg px-3 text-xs"
            >
              {resetting ? (
                <Loader2 className="size-3.5 animate-spin" />
              ) : (
                <RotateCcw className="size-3.5" strokeWidth={1.75} />
              )}
              Reset to template
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Reset to the starter template?</AlertDialogTitle>
              <AlertDialogDescription>
                This deletes every FAQ you&apos;ve added or edited and restores
                the default questions for your business. You can&apos;t undo
                this.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={reset}>Reset</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>

      <AddFaqForm onAdd={add} />

      {CATEGORY_ORDER.map((c) => (
        <CategoryGroup
          key={c}
          category={c}
          entries={grouped[c]}
          onChange={upsert}
          onRemove={remove}
        />
      ))}

      {entries.length === 0 ? (
        <div className="border-border/70 bg-card rounded-2xl border p-6 text-center">
          <p className="text-muted-foreground text-sm">
            No FAQs yet. Add your own above or reset to the starter template.
          </p>
        </div>
      ) : null}
    </div>
  );
}
