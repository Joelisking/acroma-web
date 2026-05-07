"use client";

import * as React from "react";
import { Send, Loader2, Bot, CheckCircle2, AlertCircle } from "lucide-react";
import { toast } from "sonner";

import {
  replyAction,
  handoffAction,
} from "@/lib/api/conversations-actions";
import { Button } from "@/components/ui/button";
import type { ConversationStatus } from "@/lib/api/types";
import { cn } from "@/lib/utils";

type ReplyComposerProps = {
  conversationId: string;
  status: ConversationStatus;
};

const MAX_LENGTH = 4000;

export function ReplyComposer({ conversationId, status }: ReplyComposerProps) {
  if (status === "WITH_OWNER") {
    return <ActiveComposer conversationId={conversationId} />;
  }
  return <DisabledBanner conversationId={conversationId} status={status} />;
}

function ActiveComposer({ conversationId }: { conversationId: string }) {
  const [value, setValue] = React.useState("");
  const [pending, startTransition] = React.useTransition();
  const taRef = React.useRef<HTMLTextAreaElement>(null);

  function send() {
    const trimmed = value.trim();
    if (!trimmed || pending) return;
    startTransition(async () => {
      const result = await replyAction(conversationId, trimmed);
      if (!result.ok) {
        toast.error(result.error);
        return;
      }
      setValue("");
      requestAnimationFrame(() => taRef.current?.focus());
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
          className="placeholder:text-muted-foreground text-foreground max-h-40 flex-1 resize-none bg-transparent px-2 py-1.5 text-sm leading-relaxed outline-none"
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

function DisabledBanner({
  conversationId,
  status,
}: {
  conversationId: string;
  status: Exclude<ConversationStatus, "WITH_OWNER">;
}) {
  const [pending, startTransition] = React.useTransition();
  const copy = bannerCopy(status);

  function takeOver() {
    startTransition(async () => {
      const result = await handoffAction(conversationId, "TAKE_OVER");
      if (!result.ok) {
        toast.error(result.error);
        return;
      }
      toast.success("You're now in the chat");
    });
  }

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
        <Button
          type="button"
          size="sm"
          onClick={takeOver}
          disabled={pending}
          className="bg-brand-orange hover:bg-brand-orange/90 shrink-0 gap-1.5"
        >
          {pending ? <Loader2 className="animate-spin" /> : null}
          {status === "RESOLVED" ? "Reopen" : "Take over"}
        </Button>
      </div>
    </div>
  );
}

function bannerCopy(status: Exclude<ConversationStatus, "WITH_OWNER">) {
  switch (status) {
    case "AI_HANDLING":
      return {
        Icon: Bot,
        tone: "bg-brand-blue-soft text-brand-blue",
        title: "Acroma AI is replying to this customer.",
        subtitle: "Take over to step in and send messages yourself.",
      };
    case "WAITING_FOR_OWNER":
      return {
        Icon: AlertCircle,
        tone: "bg-brand-orange-soft text-brand-orange",
        title: "Acroma escalated this thread to you.",
        subtitle: "Take over to start replying.",
      };
    case "RESOLVED":
      return {
        Icon: CheckCircle2,
        tone: "bg-brand-green-soft text-brand-green",
        title: "This conversation is resolved.",
        subtitle: "Reopen it to send another message.",
      };
  }
}
