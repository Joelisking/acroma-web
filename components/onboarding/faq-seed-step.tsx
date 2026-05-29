"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { createFaqAction } from "@/lib/api/faq-actions";
import type { FaqSeed } from "@/lib/onboarding/faq-seeds";
import {
  FAQ_CATEGORY_META,
} from "@/components/settings/knowledge-base/categories";
import { cn } from "@/lib/utils";

type SeedRow = {
  seed: FaqSeed;
  answer: string;
};

type Props = {
  seeds: FaqSeed[];
};

export function FaqSeedStep({ seeds }: Props) {
  const router = useRouter();
  const [rows, setRows] = React.useState<SeedRow[]>(
    seeds.map((seed) => ({ seed, answer: "" })),
  );
  const [pending, startTransition] = React.useTransition();

  function setAnswer(index: number, answer: string) {
    setRows((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], answer };
      return next;
    });
  }

  function onSkip() {
    router.push("/onboarding/step-7");
  }

  function onContinue() {
    const toCreate = rows.filter((r) => r.answer.trim().length > 0);
    if (toCreate.length === 0) {
      router.push("/onboarding/step-7");
      return;
    }
    startTransition(async () => {
      for (const row of toCreate) {
        const result = await createFaqAction({
          category: row.seed.category,
          question: row.seed.question,
          answer: row.answer.trim(),
          active: true,
        });
        if (!result.ok) {
          toast.error(result.error);
          return;
        }
      }
      router.push("/onboarding/step-7");
    });
  }

  if (seeds.length === 0) {
    return (
      <div className="space-y-6">
        <p className="text-muted-foreground text-sm">
          No suggested questions for your business type. You can add FAQs any
          time from Settings.
        </p>
        <div className="flex justify-end">
          <Button
            onClick={onSkip}
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
        {rows.map((row, i) => {
          const meta = FAQ_CATEGORY_META[row.seed.category];
          const Icon = meta.icon;
          const answered = row.answer.trim().length > 0;
          return (
            <div
              key={row.seed.question}
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
                {row.seed.question}
              </p>
              <textarea
                rows={2}
                value={row.answer}
                onChange={(e) => setAnswer(i, e.target.value)}
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
          onClick={onSkip}
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
