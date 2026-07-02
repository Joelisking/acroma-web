"use client";

import * as React from "react";
import Link from "next/link";
import { ChevronLeft, Info } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { InfoSheet } from "@/components/shared/info-sheet";
import { ConversationStatusPill } from "./conversation-status-pill";
import { HandoffToggle } from "./handoff-toggle";
import { PendingOwnerBanner } from "./pending-owner-banner";
import { ChatThread } from "./chat-thread";
import { ConversationInfo } from "./conversation-info";
import { formatPhone, getInitials } from "@/lib/format";
import type {
  AuditEntry,
  Business,
  ConversationWithMessages,
  Product,
} from "@/lib/api/types";

type ThreadPaneProps = {
  conversation: ConversationWithMessages;
  businessId: string;
  business: Business;
  products: Product[];
  activity: AuditEntry[];
};

/**
 * The right (thread) pane of the inbox: a sticky header with the customer, the
 * status, a "hand back to AI" control and the info trigger; the pending-owner
 * banner; the live message thread + composer; and the slide-in info panel
 * (side panel ≥ md, bottom sheet on mobile).
 */
export function ThreadPane({ conversation, businessId, business, products, activity }: ThreadPaneProps) {
  const [infoOpen, setInfoOpen] = React.useState(false);
  const display =
    conversation.customerName?.trim() || formatPhone(conversation.customerPhone);
  const initials = getInitials(conversation.customerName, "·");

  return (
    <div className="bg-paper flex h-full min-w-0 flex-1 flex-col">
      <header className="border-border bg-card/85 flex items-center gap-3 border-b px-4 pb-3 pt-[calc(env(safe-area-inset-top)+0.75rem)] backdrop-blur-md md:pt-3">
        <Link
          href="/dashboard/conversations"
          aria-label="Back to chats"
          className="text-muted-foreground hover:text-foreground -ml-1 inline-flex size-9 items-center justify-center rounded-lg md:hidden"
        >
          <ChevronLeft className="size-5" />
        </Link>
        <Avatar className="size-10">
          <AvatarFallback className="bg-brand-orange-soft text-brand-orange text-sm font-semibold">
            {initials}
          </AvatarFallback>
        </Avatar>
        <div className="min-w-0 flex-1">
          <p className="text-foreground truncate font-semibold">{display}</p>
          <div className="mt-0.5 flex items-center gap-2">
            <ConversationStatusPill status={conversation.status} />
            {conversation.customerName ? (
              <span className="text-muted-foreground truncate text-xs">
                {formatPhone(conversation.customerPhone)}
              </span>
            ) : null}
          </div>
        </div>
        <HandoffToggle conversationId={conversation.id} status={conversation.status} />
        <button
          type="button"
          onClick={() => setInfoOpen(true)}
          aria-label="Customer details"
          className="text-muted-foreground hover:text-foreground hover:bg-accent/50 inline-flex size-9 shrink-0 items-center justify-center rounded-lg transition-colors"
        >
          <Info className="size-5" />
        </button>
      </header>

      <PendingOwnerBanner
        conversationId={conversation.id}
        pendingOwnerSince={conversation.pendingOwnerSince}
        escalationReason={conversation.escalationReason}
        aiHoldingLine={conversation.status === "AI_HANDLING"}
      />

      <div className="flex min-h-0 flex-1 flex-col px-4 sm:px-6">
        <ChatThread conversation={conversation} businessId={businessId} />
      </div>

      <InfoSheet open={infoOpen} onOpenChange={setInfoOpen} title="Customer details">
        <ConversationInfo
          conversation={conversation}
          activity={activity}
          business={business}
          products={products}
        />
      </InfoSheet>
    </div>
  );
}
