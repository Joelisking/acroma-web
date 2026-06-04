"use client";

import * as React from "react";
import { Send, Loader2 } from "lucide-react";
import { toast } from "sonner";

import { replyAction } from "@/lib/api/conversations-actions";
import { Button } from "@/components/ui/button";
import { TakeOverBar } from "./take-over-bar";
import type { ConversationStatus, Message } from "@/lib/api/types";

type OptimisticHandlers = {
  onOptimisticAppend?: (msg: Message) => void;
  onOptimisticReconcile?: (tempId: string, real: Message) => void;
  onOptimisticRollback?: (tempId: string) => void;
};

type ReplyComposerProps = {
  conversationId: string;
  status: ConversationStatus;
} & OptimisticHandlers;

const MAX_LENGTH = 4000;
const MAX_HEIGHT_PX = 160; // matches max-h-40 on the textarea

// The owner can type whenever the AI is not in control: both after an explicit
// take-over (WITH_OWNER) and when the AI has escalated to them
// (WAITING_FOR_OWNER). Otherwise the slide-to-take-over bar is shown instead.
export function ReplyComposer({
  conversationId,
  status,
  ...optimistic
}: ReplyComposerProps) {
  if (status === "WITH_OWNER" || status === "WAITING_FOR_OWNER") {
    return <ActiveComposer conversationId={conversationId} {...optimistic} />;
  }
  return <TakeOverBar conversationId={conversationId} status={status} />;
}

function ActiveComposer({
  conversationId,
  onOptimisticAppend,
  onOptimisticReconcile,
  onOptimisticRollback,
}: { conversationId: string } & OptimisticHandlers) {
  const [value, setValue] = React.useState("");
  const [pending, startTransition] = React.useTransition();
  const taRef = React.useRef<HTMLTextAreaElement>(null);

  React.useLayoutEffect(() => {
    const ta = taRef.current;
    if (!ta) return;
    ta.style.height = "auto";
    ta.style.height = `${Math.min(ta.scrollHeight, MAX_HEIGHT_PX)}px`;
  }, [value]);

  function send() {
    const trimmed = value.trim();
    if (!trimmed || pending) return;

    const tempId = `temp-${Date.now()}-${Math.random().toString(36).slice(2)}`;
    const tempMessage: Message = {
      id: tempId,
      conversationId,
      sender: "OWNER",
      content: trimmed,
      whatsappMsgId: null,
      createdAt: new Date().toISOString(),
    };
    onOptimisticAppend?.(tempMessage);
    setValue("");
    requestAnimationFrame(() => taRef.current?.focus());

    startTransition(async () => {
      const result = await replyAction(conversationId, trimmed);
      if (!result.ok) {
        onOptimisticRollback?.(tempId);
        setValue(trimmed);
        toast.error(result.error);
        return;
      }
      onOptimisticReconcile?.(tempId, result.data);
    });
  }

  function onKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      send();
    }
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        send();
      }}
      className="bg-background sticky bottom-0 p-3 sm:p-4"
    >
      <div className="composer-warm focus-within:ring-ring/40 p-1.5 pl-4 focus-within:ring-2">
        <textarea
          ref={taRef}
          value={value}
          onChange={(e) => setValue(e.target.value.slice(0, MAX_LENGTH))}
          onKeyDown={onKeyDown}
          rows={1}
          placeholder="Write a message…   (⌘↵ to send)"
          aria-label="Message"
          className="placeholder:text-muted-foreground text-foreground max-h-40 flex-1 resize-none overflow-y-auto bg-transparent py-1.5 text-sm leading-relaxed outline-none"
        />
        <Button
          type="submit"
          size="icon"
          aria-label="Send"
          disabled={pending || !value.trim()}
          className="bg-brand-orange hover:bg-brand-orange/90 size-10 rounded-full"
        >
          {pending ? <Loader2 className="animate-spin" /> : <Send />}
        </Button>
      </div>
      <p className="text-muted-foreground mt-1.5 px-2 text-[0.7rem]">
        {value.length} / {MAX_LENGTH}
      </p>
    </form>
  );
}
