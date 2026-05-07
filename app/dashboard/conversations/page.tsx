import type { Metadata } from "next";
import { listConversations } from "@/lib/api/conversations";
import { getCurrentBusiness } from "@/lib/api/business";
import type { ConversationStatus } from "@/lib/api/types";
import { ConversationRow } from "@/components/conversations/conversation-row";
import { StatusFilter } from "@/components/conversations/status-filter";
import { LiveRefresh } from "@/components/conversations/live-refresh";
import { ConversationsEmpty } from "@/components/conversations/conversations-empty";

export const metadata: Metadata = { title: "Conversations · Acroma" };

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
    <div className="mx-auto flex max-w-4xl flex-col gap-6">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="eyebrow text-muted-foreground">Inbox</p>
          <h1 className="font-display text-foreground mt-1 text-3xl font-medium tracking-tight">
            Conversations
          </h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Every customer thread, live across WhatsApp.
          </p>
        </div>
        <StatusFilter />
      </header>

      {conversations.length === 0 ? (
        <ConversationsEmpty />
      ) : (
        <section className="border-border/70 bg-card overflow-hidden rounded-2xl border">
          {conversations.map((c) => (
            <ConversationRow key={c.id} conversation={c} />
          ))}
        </section>
      )}

      <LiveRefresh businessId={business.id} />
    </div>
  );
}
