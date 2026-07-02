"use client";

import * as React from "react";
import { Plus } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { ConversationStatusPill } from "./conversation-status-pill";
import { ActivityTimeline } from "./activity-timeline";
import { formatPhone, getInitials } from "@/lib/format";
import { OrderEditor } from "@/components/orders/order-editor";
import type {
  AuditEntry,
  Business,
  ConversationWithMessages,
  Product,
} from "@/lib/api/types";

const SINCE_FORMAT: Intl.DateTimeFormatOptions = { month: "short", year: "numeric" };

type ConversationInfoProps = {
  conversation: ConversationWithMessages;
  activity: AuditEntry[];
  business: Business;
  products: Product[];
};

/**
 * Shared detail panel for a conversation, shown in the desktop side column and
 * the mobile info sheet. Renders conversation identity/status/activity, plus
 * a "Create order" action that opens the order editor prefilled with this
 * customer — the escalated-custom-order path.
 */
export function ConversationInfo({
  conversation,
  activity,
  business,
  products,
}: ConversationInfoProps) {
  const [editorOpen, setEditorOpen] = React.useState(false);
  const display = conversation.customerName?.trim() || formatPhone(conversation.customerPhone);
  const initials = getInitials(conversation.customerName, "·");
  const since = new Date(conversation.createdAt).toLocaleDateString(undefined, SINCE_FORMAT);

  return (
    <div className="flex flex-col gap-5 p-5">
      <div className="flex flex-col items-center gap-3 text-center">
        <Avatar className="size-16">
          <AvatarFallback className="bg-brand-orange text-primary-foreground text-lg font-semibold">
            {initials}
          </AvatarFallback>
        </Avatar>
        <div>
          <p className="text-foreground text-lg font-bold tracking-tight">{display}</p>
          <p className="text-muted-foreground mt-0.5 text-sm">
            {formatPhone(conversation.customerPhone)} · Since {since}
          </p>
        </div>
        <ConversationStatusPill status={conversation.status} long />
        <Button type="button" variant="outline" size="sm" onClick={() => setEditorOpen(true)}>
          <Plus className="size-4" /> Create order
        </Button>
      </div>

      {conversation.pendingOwnerSince && conversation.escalationReason ? (
        <div className="bg-brand-orange-soft text-brand-orange rounded-2xl px-4 py-3 text-sm">
          <p className="text-xs font-semibold tracking-wide uppercase opacity-80">
            Why it was flagged
          </p>
          <p className="text-brand-navy/80 mt-1">{conversation.escalationReason}</p>
        </div>
      ) : null}

      <div className="card-warm overflow-hidden px-4">
        <ActivityTimeline entries={activity} className="border-t-0" />
      </div>

      <OrderEditor
        mode="create"
        open={editorOpen}
        onOpenChange={setEditorOpen}
        business={business}
        products={products}
        customerPhone={conversation.customerPhone}
        customerName={conversation.customerName}
      />
    </div>
  );
}
