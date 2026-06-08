"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { bulkUpdateFaqAction } from "@/lib/api/faq-actions";
import type { FaqEntry } from "@/lib/api/faq";
import { FAQ_CATEGORY_META } from "@/components/settings/knowledge-base/categories";
import { cn } from "@/lib/utils";

type ReviewRow = {
  id: string;
  category: FaqEntry["category"];
  question: string;
  answer: string;
};

type Props = {
  entries: FaqEntry[];
};

export function FaqReviewStep({ entries }: Props) {
  const router = useRouter();
  const [rows, setRows] = React.useState<ReviewRow[]>(
    entries.map((e) => ({
      id: e.id,
      category: e.category,
      question: e.question,
      answer: e.answer,
    })),
  );
  const [pending, startTransition] = React.useTransition();

  function setAnswer(id: string, answer: string) {
    setRows((prev) => prev.map((r) => (r.id === id ? { ...r, answer } : r)));
  }

  function goNext() {
    router.push("/onboarding/step-7");
  }

  function onContinue() {
    const toSave = rows
      .filter((r) => r.answer.trim().length > 0)
      .map((r) => ({ id: r.id, answer: r.answer.trim(), active: true }));

    if (toSave.length === 0) {
      goNext();
      return;
    }

    startTransition(async () => {
      const result = await bulkUpdateFaqAction(toSave);
      if (!result.ok) {
        toast.error(result.error);
        return;
      }
      goNext();
    });
  }

  if (entries.length === 0) {
    return (
      <div className="space-y-6">
        <p className="text-muted-foreground text-sm">
          No suggested questions for your business type. You can add FAQs any
          time from Settings.
        </p>
        <div className="flex justify-end">
          <Button
            onClick={goNext}
            className="bg-brand-orange hover:bg-brand-orange/90 h-11 rounded-xl px-6 text-sm"
          >
            Continue
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="space-y-3">
        {rows.map((row) => {
          const meta = FAQ_CATEGORY_META[row.category];
          const Icon = meta.icon;
          const answered = row.answer.trim().length > 0;
          return (
            <div
              key={row.id}
              className={cn(
                "border-border/70 bg-card space-y-3 rounded-2xl border p-4 transition-colors",
                answered && "border-brand-blue/25",
              )}
            >
              <div className="flex items-center gap-2">
                <span className="bg-muted text-muted-foreground inline-flex size-6 items-center justify-center rounded-lg">
                  <Icon className="size-3.5" strokeWidth={1.75} />
                </span>
                <span className="text-muted-foreground text-xs font-medium">
                  {meta.label}
                </span>
              </div>
              <p className="text-foreground text-sm font-medium">
                {row.question}
              </p>
              <textarea
                rows={2}
                value={row.answer}
                onChange={(e) => setAnswer(row.id, e.target.value)}
                placeholder="Your answer…"
                className="border-input bg-background hover:bg-muted/50 focus-visible:border-ring focus-visible:ring-ring/40 placeholder:text-muted-foreground w-full resize-none rounded-md border px-3 py-2 text-sm transition-colors focus-visible:ring-2 focus-visible:outline-none"
              />
            </div>
          );
        })}
      </div>

      <div className="flex items-center justify-between gap-3">
        <button
          type="button"
          onClick={goNext}
          disabled={pending}
          className="text-muted-foreground hover:text-foreground text-sm transition-colors disabled:pointer-events-none"
        >
          Skip for now
        </button>
        <Button
          onClick={onContinue}
          disabled={pending}
          className="bg-brand-orange hover:bg-brand-orange/90 h-11 gap-2 rounded-xl px-6 text-sm"
        >
          {pending ? <Loader2 className="size-4 animate-spin" /> : null}
          Continue
        </Button>
      </div>
    </div>
  );
}
