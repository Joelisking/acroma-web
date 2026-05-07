import Link from "next/link";
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
 * Single row in the conversations list. Server-renderable.
 * No live message preview yet — backend's findAll doesn't include the last
 * message body; rely on `lastMessageAt` + status to communicate state.
 */
export function ConversationRow({
  conversation,
  active,
}: ConversationRowProps) {
  const display =
    conversation.customerName?.trim() || formatPhone(conversation.customerPhone);
  const initials = getInitials(conversation.customerName, "·");

  return (
    <Link
      href={`/dashboard/conversations/${conversation.id}`}
      aria-current={active ? "true" : undefined}
      className={cn(
        "group/row border-border/60 hover:bg-accent/50 flex items-center gap-3 border-b px-3 py-3 transition-colors last:border-b-0",
        "focus-visible:bg-accent/50 focus-visible:outline-none",
        active && "bg-accent/60",
      )}
    >
      <Avatar className="size-10">
        <AvatarFallback className="bg-brand-orange-soft text-brand-orange text-xs font-semibold">
          {initials}
        </AvatarFallback>
      </Avatar>

      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <p className="text-foreground truncate text-sm font-medium">
            {display}
          </p>
          <span className="text-muted-foreground ml-auto shrink-0 text-xs tabular-nums">
            {formatRelativeShort(conversation.lastMessageAt)}
          </span>
        </div>
        <div className="mt-1 flex items-center gap-2">
          <StatusBadge status={conversation.status} />
          {conversation.customerName ? (
            <span className="text-muted-foreground truncate text-xs">
              {formatPhone(conversation.customerPhone)}
            </span>
          ) : null}
        </div>
      </div>
    </Link>
  );
}
