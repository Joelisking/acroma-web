"use client";

import * as React from "react";
import { Bot, User } from "lucide-react";
import { toast } from "sonner";
import { handoffAction } from "@/lib/api/conversations-actions";
import { Button } from "@/components/ui/button";
import type { ConversationStatus, HandoffAction } from "@/lib/api/types";

type HandoffToggleProps = {
  conversationId: string;
  status: ConversationStatus;
};

// Exactly one control is ever shown: take over when the AI is replying, hand
// back when the owner is. WAITING_FOR_OWNER (the AI escalated to the owner)
// counts as the owner being in control, so it offers "Hand back to AI" too —
// never both buttons at once.
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

  function run() {
    startTransition(async () => {
      const result = await handoffAction(conversationId, action);
      if (!result.ok) {
        toast.error(result.error);
        return;
      }
      toast.success(
        action === "TAKE_OVER" ? "You're now in the chat" : "AI is back on",
      );
    });
  }

  if (action === "TAKE_OVER") {
    return (
      <Button
        variant="outline"
        size="sm"
        disabled={pending}
        onClick={run}
        className="gap-1.5"
      >
        <User />
        Take over
      </Button>
    );
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
