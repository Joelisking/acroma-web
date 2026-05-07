import { notFound } from "next/navigation";
import type { Metadata } from "next";

import { getConversation } from "@/lib/api/conversations";
import { getCurrentBusiness } from "@/lib/api/business";
import { ApiError } from "@/lib/api/server";
import { ConversationHeader } from "@/components/conversations/conversation-header";
import { MessageBubble } from "@/components/conversations/message-bubble";
import { ReplyComposer } from "@/components/conversations/reply-composer";
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

      <div className="flex flex-1 flex-col gap-3 overflow-y-auto py-4">
        {conversation.messages.length === 0 ? (
          <p className="text-muted-foreground mx-auto mt-10 max-w-xs text-center text-sm">
            No messages yet.
          </p>
        ) : (
          conversation.messages.map((m) => (
            <MessageBubble key={m.id} message={m} />
          ))
        )}
      </div>

      <ReplyComposer
        conversationId={conversation.id}
        status={conversation.status}
      />
      <LiveRefresh businessId={business.id} />
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
