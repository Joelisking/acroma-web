import type { Metadata } from "next";
import { listConversations } from "@/lib/api/conversations";
import { getCurrentBusiness } from "@/lib/api/business";
import type { ConversationStatus } from "@/lib/api/types";
import { InboxShell } from "@/components/conversations/inbox-shell";
import { LiveRefresh } from "@/components/conversations/live-refresh";

export const metadata: Metadata = { title: "Chats · Acroma" };

const VALID_STATUSES: ConversationStatus[] = [
  "AI_HANDLING",
  "WAITING_FOR_OWNER",
  "WITH_OWNER",
  "RESOLVED",
];

type PageProps = {
  searchParams: Promise<{ status?: string }>;
};

export default async function ConversationsPage({ searchParams }: PageProps) {
  const { status: rawStatus } = await searchParams;
  const status = VALID_STATUSES.includes(rawStatus as ConversationStatus)
    ? (rawStatus as ConversationStatus)
    : undefined;

  const [business, conversations] = await Promise.all([
    getCurrentBusiness(),
    listConversations(status),
  ]);
  if (!business) return null;

  return (
    <div className="-mx-4 -mt-6 h-full sm:-mx-6 md:mx-0 md:mt-0">
      <InboxShell
        conversations={conversations}
        status={status}
        aiEnabled={business.aiEnabled}
        businessId={business.id}
      />
      <LiveRefresh businessId={business.id} />
    </div>
  );
}
