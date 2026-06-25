import Link from "next/link";
import { ChevronRight } from "lucide-react";
import type { Conversation } from "@/lib/api/types";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { StatusBadge } from "./status-badge";
import { formatRelativeShort, formatPhone, getInitials } from "@/lib/format";
import { cn } from "@/lib/utils";

type ConversationRowProps = {
  conversation: Conversation;
  active?: boolean;
};

/**
 * Single row in the conversations list. Server-renderable. A thread the owner
 * still owes a personal reply (`pendingOwnerSince`) is lifted out of the
 * neutral list with a warm tint, a heavier name, and a "Waiting · Xm" pill, so
 * escalations are impossible to scroll past. No live message preview yet
 * (the list endpoint omits the last body); status + timing carry the state.
 */
export function ConversationRow({ conversation, active }: ConversationRowProps) {
  const display =
    conversation.customerName?.trim() || formatPhone(conversation.customerPhone);
  const initials = getInitials(conversation.customerName, "·");
  const waiting = Boolean(conversation.pendingOwnerSince);

  return (
    <Link
      href={`/dashboard/conversations/${conversation.id}`}
      aria-current={active ? "true" : undefined}
      className={cn(
        "group/row border-border/60 flex items-center gap-3 border-b px-3 py-3.5 transition-colors last:border-b-0",
        "focus-visible:outline-none",
        waiting
          ? "bg-brand-orange-soft/60 hover:bg-brand-orange-soft focus-visible:bg-brand-orange-soft"
          : "hover:bg-accent/50 focus-visible:bg-accent/50",
        active && !waiting && "bg-accent/60",
      )}
    >
      <Avatar className="size-11">
        <AvatarFallback
          className={cn(
            "text-sm font-semibold",
            waiting
              ? "bg-brand-orange text-primary-foreground"
              : "bg-brand-orange-soft text-brand-orange",
          )}
        >
          {initials}
        </AvatarFallback>
      </Avatar>

      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <p
            className={cn(
              "text-foreground truncate text-[0.95rem]",
              waiting ? "font-semibold" : "font-medium",
            )}
          >
            {display}
          </p>
          <span className="text-muted-foreground ml-auto shrink-0 text-xs tabular-nums">
            {formatRelativeShort(conversation.lastMessageAt)}
          </span>
        </div>
        <div className="mt-1.5 flex items-center gap-2">
          {waiting ? (
            <span className="bg-brand-orange text-primary-foreground inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[0.7rem] font-semibold">
              Waiting · {formatRelativeShort(conversation.pendingOwnerSince!)}
            </span>
          ) : (
            <StatusBadge status={conversation.status} />
          )}
          {conversation.customerName ? (
            <span className="text-muted-foreground truncate text-xs tabular-nums">
              {formatPhone(conversation.customerPhone)}
            </span>
          ) : null}
        </div>
      </div>

      <ChevronRight className="text-muted-foreground/50 size-4 shrink-0" />
    </Link>
  );
}
