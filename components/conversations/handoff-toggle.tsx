"use client";

import * as React from "react";
import { Bot, User } from "lucide-react";
import { toast } from "sonner";
import { handoffAction } from "@/lib/api/conversations-actions";
import { Button } from "@/components/ui/button";
import type { ConversationStatus } from "@/lib/api/types";

type HandoffToggleProps = {
  conversationId: string;
  status: ConversationStatus;
};

/**
 * Switch a conversation between AI handling and owner handling.
 * The actual cause + effect is one-tap, with optimistic toast feedback.
 */
export function HandoffToggle({
  conversationId,
  status,
}: HandoffToggleProps) {
  const [pending, startTransition] = React.useTransition();
  const ownerHasIt = status === "WITH_OWNER";

  function toggle() {
    startTransition(async () => {
      const result = await handoffAction(
        conversationId,
        ownerHasIt ? "RESUME_AI" : "TAKE_OVER",
      );
      if (!result.ok) toast.error(result.error);
      else toast.success(ownerHasIt ? "AI is back on" : "You're now in the chat");
    });
  }

  return (
    <Button
      variant={ownerHasIt ? "secondary" : "outline"}
      size="sm"
      onClick={toggle}
      disabled={pending}
      className="gap-1.5"
    >
      {ownerHasIt ? <Bot /> : <User />}
      {ownerHasIt ? "Hand back to AI" : "Take over"}
    </Button>
  );
}
