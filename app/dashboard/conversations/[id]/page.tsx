import { notFound } from "next/navigation";
import type { Metadata } from "next";

import { getConversation } from "@/lib/api/conversations";
import { getCurrentBusiness } from "@/lib/api/business";
import { ApiError } from "@/lib/api/server";
import { ConversationHeader } from "@/components/conversations/conversation-header";
import { ChatThread } from "@/components/conversations/chat-thread";
import { LiveRefresh } from "@/components/conversations/live-refresh";

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

  return (
    <div className="mx-auto flex h-[calc(100svh-7rem)] w-full max-w-3xl flex-col lg:h-[calc(100svh-6rem)]">
      <ConversationHeader conversation={conversation} />
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
