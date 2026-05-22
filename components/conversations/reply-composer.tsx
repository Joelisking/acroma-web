"use client";

import * as React from "react";
import { Send, Loader2, Bot, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";

import { replyAction } from "@/lib/api/conversations-actions";
import { Button } from "@/components/ui/button";
import type { ConversationStatus, Message } from "@/lib/api/types";
import { cn } from "@/lib/utils";

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
// take-over (WITH_OWNER) and when the AI has escalated the thread to them
// (WAITING_FOR_OWNER). The take-over / hand-back button lives in the header's
// HandoffToggle, so the composer never renders one of its own.
export function ReplyComposer({
  conversationId,
  status,
  ...optimistic
}: ReplyComposerProps) {
  if (status === "WITH_OWNER" || status === "WAITING_FOR_OWNER") {
    return <ActiveComposer conversationId={conversationId} {...optimistic} />;
  }
  return <DisabledBanner status={status} />;
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

  // Grow the textarea to fit its content (up to a cap) so a multi-line draft
  // stays fully visible instead of scrolling out of view as you press Enter.
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
      className="border-border/70 bg-background sticky bottom-0 border-t p-3 sm:p-4"
    >
      <div
        className={cn(
          "border-border/70 bg-card focus-within:ring-ring/40 flex items-end gap-2 rounded-2xl border p-2",
          "focus-within:ring-2",
        )}
      >
        <textarea
          ref={taRef}
          value={value}
          onChange={(e) => setValue(e.target.value.slice(0, MAX_LENGTH))}
          onKeyDown={onKeyDown}
          rows={1}
          placeholder="Type a message…   (⌘↵ to send)"
          aria-label="Message"
          className="placeholder:text-muted-foreground text-foreground max-h-40 flex-1 resize-none overflow-y-auto bg-transparent px-2 py-1.5 text-sm leading-relaxed outline-none"
        />
        <Button
          type="submit"
          size="icon"
          aria-label="Send"
          disabled={pending || !value.trim()}
          className="bg-brand-orange hover:bg-brand-orange/90 size-9 rounded-xl"
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

function DisabledBanner({ status }: { status: "AI_HANDLING" | "RESOLVED" }) {
  const copy = bannerCopy(status);

  return (
    <div className="border-border/70 bg-background sticky bottom-0 border-t p-3 sm:p-4">
      <div className="border-border/70 bg-card flex items-center gap-3 rounded-2xl border p-3">
        <span
          className={cn(
            "flex size-9 shrink-0 items-center justify-center rounded-xl",
            copy.tone,
          )}
        >
          <copy.Icon className="size-4" strokeWidth={1.75} />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-foreground text-sm font-medium">{copy.title}</p>
          <p className="text-muted-foreground text-xs leading-relaxed">
            {copy.subtitle}
          </p>
        </div>
      </div>
    </div>
  );
}

function bannerCopy(status: "AI_HANDLING" | "RESOLVED") {
  switch (status) {
    case "AI_HANDLING":
      return {
        Icon: Bot,
        tone: "bg-brand-blue-soft text-brand-blue",
        title: "Acroma AI is replying to this customer.",
        subtitle: "Use Take over above to step in and reply yourself.",
      };
    case "RESOLVED":
      return {
        Icon: CheckCircle2,
        tone: "bg-brand-green-soft text-brand-green",
        title: "This conversation is resolved.",
        subtitle: "Use Take over above to reopen and send another message.",
      };
  }
}
