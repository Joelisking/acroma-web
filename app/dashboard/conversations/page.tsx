import type { Metadata } from "next";
import Link from "next/link";
import { Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { listConversations } from "@/lib/api/conversations";
import { getCurrentBusiness } from "@/lib/api/business";
import type { ConversationStatus } from "@/lib/api/types";
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
        <div className="flex items-center gap-3">
          {isServices ? (
            <Button asChild variant="outline" className="h-9 gap-1.5 rounded-xl">
              <Link href="/dashboard/customers">
                <Users className="size-4" />
                Customers
              </Link>
            </Button>
          ) : null}
          <AiModeToggle initialEnabled={business.aiEnabled} />
          <StatusFilter />
        </div>
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
