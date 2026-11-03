"use client";

import * as React from "react";
import { Bot } from "lucide-react";
import { toast } from "sonner";
import { handoffAction } from "@/lib/api/conversations-actions";
import { useConfirmedAction } from "@/components/impersonation/use-confirmed-action";
import { Button } from "@/components/ui/button";
import type { ConversationStatus, HandoffAction } from "@/lib/api/types";

type HandoffToggleProps = {
  conversationId: string;
  status: ConversationStatus;
};

// WAITING_FOR_OWNER (AI escalated) and WITH_OWNER both mean the owner is in
// control, so the header offers "Hand back to AI". When the AI is in control
// (AI_HANDLING / RESOLVED) the take-over path is the slide bar above the
// composer, so the header shows nothing.
function actionFor(status: ConversationStatus): HandoffAction {
  switch (status) {
    case "WAITING_FOR_OWNER":
    case "WITH_OWNER":
      return "RESUME_AI";
    case "AI_HANDLING":
    case "RESOLVED":
    default:
      return "TAKE_OVER";
  }
}

export function HandoffToggle({ conversationId, status }: HandoffToggleProps) {
  const [pending, startTransition] = React.useTransition();
  const action = actionFor(status);
  const confirm = useConfirmedAction();

  if (action === "TAKE_OVER") return null;

  function run() {
    startTransition(async () => {
      const result = await confirm(
        { title: "Hand conversation back to AI" },
        () => handoffAction(conversationId, action),
      );
      if (!result) return;
      if (!result.ok) {
        toast.error(result.error);
        return;
      }
      toast.success("AI is back on");
    });
  }

  return (
    <Button
      variant="secondary"
      size="sm"
      disabled={pending}
      onClick={run}
      className="gap-1.5"
    >
      <Bot />
      Hand back to AI
    </Button>
  );
}
