import { notFound } from "next/navigation";
import type { Metadata } from "next";

import { getConversation, listConversations } from "@/lib/api/conversations";
import { getCurrentBusiness } from "@/lib/api/business";
import { listAudit } from "@/lib/api/audit";
import { listProducts } from "@/lib/api/products";
import { ApiError } from "@/lib/api/server";
import type { AuditEntry } from "@/lib/api/types";
import { InboxShell } from "@/components/conversations/inbox-shell";
import { LiveRefresh } from "@/components/conversations/live-refresh";

type PageProps = { params: Promise<{ id: string }> };

export const metadata: Metadata = { title: "Chat · Acroma" };

export default async function ConversationDetailPage({ params }: PageProps) {
  const { id } = await params;

  const [business, conversation, conversations, products] = await Promise.all([
    getCurrentBusiness(),
    safeGetConversation(id),
    listConversations(),
    listProducts(),
  ]);
  if (!business) return null;
  if (!conversation) notFound();

  const activity = await safeListActivity(conversation.id);

  return (
    <div className="bg-paper fixed inset-0 z-30 md:static md:inset-auto md:z-auto md:h-full md:bg-transparent">
      <InboxShell
        conversations={conversations}
        aiEnabled={business.aiEnabled}
        businessId={business.id}
        business={business}
        products={products}
        activeConversation={conversation}
        activity={activity}
      />
      <LiveRefresh businessId={business.id} events={["conversation_updated"]} />
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

// The Activity timeline is a non-critical aid; never let an audit fetch failure
// take down the conversation view.
async function safeListActivity(conversationId: string): Promise<AuditEntry[]> {
  try {
    return await listAudit({ conversationId });
  } catch {
    return [];
  }
}
