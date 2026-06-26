import Link from "next/link";
import { Bot } from "lucide-react";

import { LogoMark } from "@/components/brand/logo-mark";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { formatPhone, getInitials, formatRelativeShort } from "@/lib/format";
import type { DashboardActivityConversation } from "@/lib/api/types";

type AcromaHandlingListProps = {
  conversations: DashboardActivityConversation[];
};

/**
 * The conversations Acroma's AI is handling on the owner's behalf. Renders
 * nothing when the list is empty so the home surface stays uncluttered.
 */
export function AcromaHandlingList({ conversations }: AcromaHandlingListProps) {
  if (conversations.length === 0) return null;

  return (
    <section aria-labelledby="acroma-handling-heading">
      <div className="mb-3 flex items-center gap-2">
        <span className="bg-brand-blue-soft text-brand-blue flex size-6 items-center justify-center rounded-md">
          <LogoMark tone="current" className="size-3.5" />
        </span>
        <h2 id="acroma-handling-heading" className="text-sm font-semibold">
          Acroma is handling
        </h2>
        <span className="text-muted-foreground ml-auto text-xs">
          {conversations.length} chats
        </span>
      </div>

      <div className="card-calm divide-border/70 divide-y overflow-hidden p-0">
        {conversations.map((c) => {
          const name = c.customerName?.trim() || formatPhone(c.customerPhone);
          return (
            <Link
              key={c.id}
              href={`/dashboard/conversations/${c.id}`}
              className="hover:bg-muted/40 flex items-center gap-3 px-4 py-3 transition-colors"
            >
              <Avatar className="size-10">
                <AvatarFallback className="bg-brand-orange-soft text-brand-orange text-xs font-semibold">
                  {getInitials(c.customerName, "·")}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold">{name}</p>
                <p className="text-muted-foreground text-xs">
                  {formatRelativeShort(c.lastMessageAt)}
                </p>
              </div>
              <span className="bg-brand-blue-soft text-brand-blue inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[0.7rem] font-medium">
                <Bot className="size-3" />
                AI
              </span>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
