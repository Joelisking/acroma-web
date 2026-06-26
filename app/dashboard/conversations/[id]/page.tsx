import { notFound } from "next/navigation";
import type { Metadata } from "next";

import { getConversation } from "@/lib/api/conversations";
import { getCurrentBusiness } from "@/lib/api/business";
import { listAudit } from "@/lib/api/audit";
import { ApiError } from "@/lib/api/server";
import { cn } from "@/lib/utils";
import type { AuditEntry } from "@/lib/api/types";
import { ConversationHeader } from "@/components/conversations/conversation-header";
import { ChatThread } from "@/components/conversations/chat-thread";
import { ActivityTimeline } from "@/components/conversations/activity-timeline";
import { LiveRefresh } from "@/components/conversations/live-refresh";
import { PendingOwnerBanner } from "@/components/conversations/pending-owner-banner";

type PageProps = { params: Promise<{ id: string }> };

export const metadata: Metadata = { title: "Conversation · Acroma" };

export default async function ConversationDetailPage({ params }: PageProps) {
  const { id } = await params;

  const [business, conversation] = await Promise.all([
    getCurrentBusiness(),
    safeGetConversation(id),
  ]);
  if (!business) return null;
  if (!conversation) notFound();

  const activity = await safeListActivity(conversation.id);

  return (
    <div
      className={cn(
        // Full-height chat pane. Cancel the dashboard shell's vertical padding
        // so the thread fills the viewport and the composer reaches the true
        // bottom (the calc restores the height the negative margins remove).
        // Coupled to <main>'s padding in app/dashboard/layout.tsx:
        // mobile pt-6 (1.5rem) + pb-24 (6rem) = 7.5rem; lg pt-6 + pb-10 = 4rem.
        "mx-auto flex h-[calc(100%+7.5rem)] w-full max-w-3xl flex-col",
        "-mt-6 -mb-24 min-h-0 lg:-mt-6 lg:-mb-10 lg:h-[calc(100%+4rem)]",
      )}
    >
      <ConversationHeader conversation={conversation} />
      <PendingOwnerBanner
        conversationId={conversation.id}
        pendingOwnerSince={conversation.pendingOwnerSince}
        escalationReason={conversation.escalationReason}
        aiHoldingLine={conversation.status === "AI_HANDLING"}
      />
      <ActivityTimeline entries={activity} />
      <ChatThread conversation={conversation} businessId={business.id} />
      <LiveRefresh
        businessId={business.id}
        events={["conversation_updated"]}
      />
    </div>
  );
}

async function safeGetConversation(id: string) {
  try {
    return await getConversation(id);
  } catch (err) {
    if (err instanceof ApiError && err.status === 404) return null;
    throw err;
  }
}

// The Activity timeline is a non-critical debugging aid; never let an audit
// fetch failure take down the conversation view.
async function safeListActivity(conversationId: string): Promise<AuditEntry[]> {
  try {
    return await listAudit({ conversationId });
  } catch {
    return [];
  }
}
