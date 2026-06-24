import { notFound } from "next/navigation";
import type { Metadata } from "next";

import { getConversation } from "@/lib/api/conversations";
import { getCurrentBusiness } from "@/lib/api/business";
import { listAudit } from "@/lib/api/audit";
import { ApiError } from "@/lib/api/server";
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
    <div className="mx-auto flex h-full w-full max-w-3xl flex-col">
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
