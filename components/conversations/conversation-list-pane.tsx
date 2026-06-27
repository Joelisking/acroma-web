"use client";

import * as React from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { Search } from "lucide-react";
import type { Conversation, ConversationStatus } from "@/lib/api/types";
import { SegmentedControl, type Segment } from "@/components/shared/segmented-control";
import { AiModeToggle } from "./ai-mode-toggle";
import { ConversationRow } from "./conversation-row";
import { ConversationsEmpty } from "./conversations-empty";
import { formatPhone } from "@/lib/format";

type ConversationListPaneProps = {
  conversations: Conversation[];
  status?: ConversationStatus;
  aiEnabled: boolean;
  activeId?: string;
};

/** Threads owed a personal reply float to the top, newest-first within a group. */
function byUrgency(a: Conversation, b: Conversation): number {
  const aw = a.pendingOwnerSince ? 1 : 0;
  const bw = b.pendingOwnerSince ? 1 : 0;
  if (aw !== bw) return bw - aw;
  return new Date(b.lastMessageAt).getTime() - new Date(a.lastMessageAt).getTime();
}

/**
 * The left pane of the inbox: title + AI on/off, a client search box, status
 * filter segments (wired to the `status` query param), and the live thread list.
 * Search filters the loaded page client-side; the segments refetch server-side.
 */
export function ConversationListPane({
  conversations,
  status,
  aiEnabled,
  activeId,
}: ConversationListPaneProps) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const [query, setQuery] = React.useState("");

  const waitingCount = conversations.filter((c) => c.pendingOwnerSince).length;

  const segments: Segment[] = [
    { value: "ALL", label: "All" },
    { value: "WAITING_FOR_OWNER", label: "Needs you", count: waitingCount || undefined },
    { value: "AI_HANDLING", label: "AI" },
    { value: "WITH_OWNER", label: "You" },
    { value: "RESOLVED", label: "Resolved" },
  ];

  function setStatus(value: string) {
    const next = new URLSearchParams(params);
    if (value === "ALL") next.delete("status");
    else next.set("status", value);
    const qs = next.toString();
    router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
  }

  const sorted = [...conversations].sort(byUrgency);
  const q = query.trim().toLowerCase();
  const filtered = q
    ? sorted.filter(
        (c) =>
          c.customerName?.toLowerCase().includes(q) ||
          formatPhone(c.customerPhone).toLowerCase().includes(q) ||
          c.customerPhone.includes(q),
      )
    : sorted;

  return (
    <div className="bg-card flex h-full w-full flex-col">
      <div className="flex flex-col gap-3 p-4">
        <div className="flex items-center justify-between gap-3">
          <h1 className="text-foreground text-xl font-bold tracking-tight">Chats</h1>
          <AiModeToggle initialEnabled={aiEnabled} />
        </div>
        <div className="bg-paper border-border flex items-center gap-2 rounded-xl border px-3 py-2">
          <Search className="text-muted-foreground size-4 shrink-0" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by name or number"
            aria-label="Search chats"
            className="text-foreground placeholder:text-muted-foreground min-w-0 flex-1 bg-transparent text-sm outline-none"
          />
        </div>
        <SegmentedControl
          segments={segments}
          value={status ?? "ALL"}
          onValueChange={setStatus}
          aria-label="Filter chats by status"
        />
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto">
        {filtered.length === 0 ? (
          <ConversationsEmpty filtered={Boolean(q || status)} />
        ) : (
          filtered.map((c) => (
            <ConversationRow key={c.id} conversation={c} active={c.id === activeId} />
          ))
        )}
      </div>
    </div>
  );
}
