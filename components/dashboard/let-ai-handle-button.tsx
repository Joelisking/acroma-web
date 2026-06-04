"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Bot, Loader2 } from "lucide-react";
import { toast } from "sonner";

import { handoffAction } from "@/lib/api/conversations-actions";

type Props = { conversationId: string };

/**
 * Secondary affordance on the Needs-you hero: hand the escalated conversation
 * back to Acroma without replying. Resumes AI handling, then refreshes the
 * home so the hero clears.
 */
export function LetAiHandleButton({ conversationId }: Props) {
  const router = useRouter();
  const [pending, startTransition] = React.useTransition();

  function run() {
    startTransition(async () => {
      const result = await handoffAction(conversationId, "RESUME_AI");
      if (!result.ok) {
        toast.error(result.error);
        return;
      }
      toast.success("Acroma is handling it again");
      router.refresh();
    });
  }

  return (
    <button
      type="button"
      onClick={run}
      disabled={pending}
      aria-label="Let Acroma handle it"
      className="inline-flex h-10 w-12 shrink-0 items-center justify-center rounded-xl bg-white/20 text-white transition hover:bg-white/30 disabled:opacity-60"
    >
      {pending ? (
        <Loader2 className="size-4 animate-spin" />
      ) : (
        <Bot className="size-4" />
      )}
    </button>
  );
}
