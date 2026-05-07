import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { StatusBadge } from "./status-badge";
import { HandoffToggle } from "./handoff-toggle";
import { formatPhone, getInitials } from "@/lib/format";
import type { ConversationWithMessages } from "@/lib/api/types";

export function ConversationHeader({
  conversation,
}: {
  conversation: ConversationWithMessages;
}) {
  const display =
    conversation.customerName?.trim() || formatPhone(conversation.customerPhone);
  const initials = getInitials(conversation.customerName, "·");

  return (
    <header className="border-border/70 bg-background/85 sticky top-16 z-20 -mx-4 flex items-center gap-3 border-b px-4 py-3 backdrop-blur-md sm:-mx-6 sm:px-6 lg:top-0 lg:-mx-10 lg:px-10">
      <Link
        href="/dashboard/conversations"
        aria-label="Back to conversations"
        className="text-muted-foreground hover:text-foreground -ml-1 inline-flex size-9 items-center justify-center rounded-lg lg:hidden"
      >
        <ChevronLeft className="size-5" />
      </Link>
      <Avatar className="size-10">
        <AvatarFallback className="bg-brand-orange-soft text-brand-orange text-sm font-semibold">
          {initials}
        </AvatarFallback>
      </Avatar>
      <div className="min-w-0 flex-1">
        <p className="text-foreground truncate text-sm font-medium">
          {display}
        </p>
        <div className="mt-0.5 flex items-center gap-2">
          <StatusBadge status={conversation.status} />
          {conversation.customerName ? (
            <span className="text-muted-foreground truncate text-xs">
              {formatPhone(conversation.customerPhone)}
            </span>
          ) : null}
        </div>
      </div>
      <HandoffToggle
        conversationId={conversation.id}
        status={conversation.status}
      />
    </header>
  );
}
