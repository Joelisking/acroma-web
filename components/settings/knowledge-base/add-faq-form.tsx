"use client";

import * as React from "react";
import { Loader2, Plus } from "lucide-react";
import { toast } from "sonner";
import { createFaqAction } from "@/lib/api/faq-actions";
import type { FaqCategory, FaqEntry } from "@/lib/api/faq";
import { CATEGORY_ORDER, FAQ_CATEGORY_META } from "./categories";
import { Button } from "@/components/ui/button";

type AddFaqFormProps = {
  onAdd: (entry: FaqEntry) => void;
};

export function AddFaqForm({ onAdd }: AddFaqFormProps) {
  const [category, setCategory] = React.useState<FaqCategory>("OTHER");
  const [question, setQuestion] = React.useState("");
  const [answer, setAnswer] = React.useState("");
  const [pending, startTransition] = React.useTransition();

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!question.trim() || !answer.trim()) {
      toast.error("Add both a question and an answer.");
      return;
    }
    startTransition(async () => {
      const result = await createFaqAction({
        category,
        question: question.trim(),
        answer: answer.trim(),
        active: true,
      });
      if (!result.ok) {
        toast.error(result.error);
        return;
      }
      onAdd(result.data);
      setQuestion("");
      setAnswer("");
      setCategory("OTHER");
      toast.success("FAQ added");
    });
  }

  return (
    <form
      onSubmit={submit}
      className="border-border/70 bg-card space-y-3 rounded-2xl border p-4"
    >
      <p className="text-foreground text-sm font-medium">Add your own FAQ</p>

      <div className="grid gap-3 sm:grid-cols-[160px_minmax(0,1fr)]">
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value as FaqCategory)}
          className="border-input bg-background focus-visible:border-ring focus-visible:ring-ring/40 h-9 rounded-md border px-2 text-sm focus-visible:ring-2 focus-visible:outline-none"
        >
          {CATEGORY_ORDER.map((c) => (
            <option key={c} value={c}>
              {FAQ_CATEGORY_META[c].label}
            </option>
          ))}
        </select>
        <input
          type="text"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder="What do customers ask?"
          maxLength={200}
          className="border-input bg-background focus-visible:border-ring focus-visible:ring-ring/40 placeholder:text-muted-foreground h-9 w-full rounded-md border px-3 text-sm focus-visible:ring-2 focus-visible:outline-none"
        />
      </div>

      <textarea
        value={answer}
        onChange={(e) => setAnswer(e.target.value)}
        rows={3}
        maxLength={2000}
        placeholder="What's the right answer?"
        className="border-input bg-background focus-visible:border-ring focus-visible:ring-ring/40 placeholder:text-muted-foreground min-h-[72px] w-full resize-y rounded-md border px-3 py-2 text-sm focus-visible:ring-2 focus-visible:outline-none"
      />

      <div className="flex justify-end">
        <Button
          type="submit"
          disabled={pending}
          className="h-9 gap-2 rounded-xl px-4 text-sm"
        >
          {pending ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <Plus className="size-4" />
          )}
          Add FAQ
        </Button>
      </div>
    </form>
  );
}
