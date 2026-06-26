import { MessagesSquare } from "lucide-react";
import { cn } from "@/lib/utils";
import { ConversationListPane } from "./conversation-list-pane";
import { ThreadPane } from "./thread-pane";
import type {
  AuditEntry,
  Conversation,
  ConversationStatus,
  ConversationWithMessages,
} from "@/lib/api/types";

type InboxShellProps = {
  conversations: Conversation[];
  status?: ConversationStatus;
  aiEnabled: boolean;
  businessId: string;
  /** When set, its thread fills the right pane (and the list collapses on mobile). */
  activeConversation?: ConversationWithMessages;
  activity?: AuditEntry[];
};

/**
 * The Chats workspace. On md+ the thread list sits beside the open thread so you
 * never lose your place; on mobile it's list-only (index route) or thread-only
 * (the [id] route). One component serves both routes — pass `activeConversation`
 * for the detail route, omit it for the index.
 */
export function InboxShell({
  conversations,
  status,
  aiEnabled,
  businessId,
  activeConversation,
  activity = [],
}: InboxShellProps) {
  const hasActive = Boolean(activeConversation);

  return (
    <div className="border-border bg-card flex h-full w-full overflow-hidden rounded-2xl border">
      <div
        className={cn(
          "border-border min-w-0 shrink-0 md:w-[340px] md:border-r",
          hasActive ? "hidden w-full md:flex" : "flex w-full",
        )}
      >
        <ConversationListPane
          conversations={conversations}
          status={status}
          aiEnabled={aiEnabled}
          activeId={activeConversation?.id}
        />
      </div>

      {activeConversation ? (
        <ThreadPane
          conversation={activeConversation}
          businessId={businessId}
          activity={activity}
        />
      ) : (
        <div className="bg-paper hidden flex-1 flex-col items-center justify-center gap-3 p-10 text-center md:flex">
          <span className="bg-brand-orange-soft text-brand-orange flex size-14 items-center justify-center rounded-2xl">
            <MessagesSquare className="size-6" strokeWidth={1.75} />
          </span>
          <div>
            <p className="text-foreground font-semibold">Select a conversation</p>
            <p className="text-muted-foreground mt-1 max-w-xs text-sm">
              Pick a thread on the left to read it and step in when a customer needs you.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
