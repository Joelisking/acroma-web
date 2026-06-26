import Link from "next/link";
import { Send } from "lucide-react";

import { LogoMark } from "@/components/brand/logo-mark";
import { formatPhone, getInitials, formatRelativeShort } from "@/lib/format";
import type { DashboardActivityConversation } from "@/lib/api/types";
import { LetAiHandleButton } from "./let-ai-handle-button";

type NeedsYouHeroProps = {
  conversation: DashboardActivityConversation;
};

/**
 * Warm gradient hero on the home surface: the single most-urgent conversation
 * waiting on the owner, with a one-tap path into the thread.
 */
export function NeedsYouHero({ conversation }: NeedsYouHeroProps) {
  const name =
    conversation.customerName?.trim() ||
    formatPhone(conversation.customerPhone);
  const initials = getInitials(conversation.customerName, "·");

  return (
    <section className="needs-hero p-5" aria-labelledby="needs-you-heading">
      <p
        id="needs-you-heading"
        className="text-xs font-semibold tracking-wide text-white/90"
      >
        Needs you
      </p>
      <div className="mt-3 flex items-center gap-3">
        <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-white/20 text-sm font-bold">
          {initials}
        </span>
        <div className="min-w-0 flex-1">
          <p className="truncate font-semibold">{name}</p>
          <p className="text-sm text-white/90">
            Waiting since {formatRelativeShort(conversation.lastMessageAt)}
          </p>
        </div>
      </div>
      <div className="mt-4 flex items-center gap-2">
        <Link
          href={`/dashboard/conversations/${conversation.id}`}
          className="text-brand-orange inline-flex h-10 flex-1 items-center justify-center gap-2 rounded-xl bg-white font-semibold transition hover:bg-white/90"
        >
          <Send className="size-4" />
          Reply now
        </Link>
        <LetAiHandleButton conversationId={conversation.id} />
      </div>
    </section>
  );
}

/**
 * Calm empty state shown when nothing is waiting on the owner.
 */
export function CaughtUpHero() {
  return (
    <section
      className="card-calm flex items-center gap-3 p-5"
      aria-label="All caught up"
    >
      <span className="bg-brand-green-soft text-brand-green flex size-10 shrink-0 items-center justify-center rounded-xl">
        <LogoMark tone="current" className="size-5" />
      </span>
      <div>
        <p className="text-sm font-semibold">You are all caught up</p>
        <p className="text-muted-foreground text-xs">
          Acroma is replying to everyone right now.
        </p>
      </div>
    </section>
  );
}
