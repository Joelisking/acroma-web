import { MessageSquare } from "lucide-react";
import { EmptyState } from "@/components/shared/empty-state";

export function ConversationsEmpty({ filtered = false }: { filtered?: boolean }) {
  if (filtered) {
    return (
      <EmptyState
        icon={MessageSquare}
        tone="muted"
        title="Nothing matches that filter."
        description="Try a different status, or clear the filter to see every thread."
      />
    );
  }
  return (
    <EmptyState
      icon={MessageSquare}
      title="No conversations yet."
      description="When customers message your WhatsApp number, their threads land here instantly, in real time."
    />
  );
}
