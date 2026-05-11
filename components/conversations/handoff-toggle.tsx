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

type ButtonKind = "TAKE_OVER" | "RESUME_AI";

function buttonsFor(status: ConversationStatus): ButtonKind[] {
  switch (status) {
    case "WAITING_FOR_OWNER":
      return ["TAKE_OVER", "RESUME_AI"];
    case "WITH_OWNER":
      return ["RESUME_AI"];
    case "AI_HANDLING":
    case "RESOLVED":
    default:
      return ["TAKE_OVER"];
  }
}

export function HandoffToggle({
  conversationId,
  status,
}: HandoffToggleProps) {
  const [pending, startTransition] = React.useTransition();
  const kinds = buttonsFor(status);

  function run(kind: ButtonKind) {
    startTransition(async () => {
      const action: HandoffAction = kind;
      const result = await handoffAction(conversationId, action);
      if (!result.ok) {
        toast.error(result.error);
        return;
      }
      toast.success(
        kind === "TAKE_OVER" ? "You're now in the chat" : "AI is back on",
      );
    });
  }

  return (
    <div className="flex gap-2">
      {kinds.map((kind) =>
        kind === "TAKE_OVER" ? (
          <Button
            key="TAKE_OVER"
            variant="outline"
            size="sm"
            disabled={pending}
            onClick={() => run("TAKE_OVER")}
            className="gap-1.5"
          >
            <User />
            Take over
          </Button>
        ) : (
          <Button
            key="RESUME_AI"
            variant="secondary"
            size="sm"
            disabled={pending}
            onClick={() => run("RESUME_AI")}
            className="gap-1.5"
          >
            <Bot />
            Hand back to AI
          </Button>
        ),
      )}
    </div>
  );
}
