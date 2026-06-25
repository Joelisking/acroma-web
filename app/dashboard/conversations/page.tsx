import type { Metadata } from "next";
import Link from "next/link";
import { Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { listConversations } from "@/lib/api/conversations";
import { getCurrentBusiness } from "@/lib/api/business";
import type { Conversation, ConversationStatus } from "@/lib/api/types";
import { PageHeader } from "@/components/shared/page-header";
import { ConversationRow } from "@/components/conversations/conversation-row";
import { StatusFilter } from "@/components/conversations/status-filter";
import { AiModeToggle } from "@/components/conversations/ai-mode-toggle";
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

/** Threads owed a personal reply float to the top, newest-first within each group. */
function sortByUrgency(a: Conversation, b: Conversation): number {
  const aw = a.pendingOwnerSince ? 1 : 0;
  const bw = b.pendingOwnerSince ? 1 : 0;
  if (aw !== bw) return bw - aw;
  return (
    new Date(b.lastMessageAt).getTime() - new Date(a.lastMessageAt).getTime()
  );
}

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

  const isServices = business.businessType === "SERVICES";
  const sorted = [...conversations].sort(sortByUrgency);
  const waitingCount = conversations.filter((c) => c.pendingOwnerSince).length;

  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col gap-6">
      <PageHeader
        title="Conversations"
        description="Every customer thread, live across WhatsApp."
        actions={
          <>
            {isServices ? (
              <Button asChild variant="outline" size="sm" className="h-9 gap-1.5">
                <Link href="/dashboard/customers">
                  <Users className="size-4" />
                  Customers
                </Link>
              </Button>
            ) : null}
            <AiModeToggle initialEnabled={business.aiEnabled} />
            <StatusFilter />
          </>
        }
      />

      {waitingCount > 0 ? (
        <p
          className="bg-brand-orange-soft text-brand-orange rounded-xl px-4 py-2.5 text-sm font-medium"
          role="status"
        >
          {waitingCount} {waitingCount === 1 ? "customer is" : "customers are"}{" "}
          waiting on a personal reply from you.
        </p>
      ) : null}

      {sorted.length === 0 ? (
        <ConversationsEmpty filtered={status !== undefined} />
      ) : (
        <section className="card-calm overflow-hidden p-0">
          {sorted.map((c) => (
            <ConversationRow key={c.id} conversation={c} />
          ))}
        </section>
      )}

      <LiveRefresh businessId={business.id} />
    </div>
  );
}
