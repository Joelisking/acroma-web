import { Bot, Clock, User, CheckCircle2, type LucideIcon } from "lucide-react";
import { StatusPill, type PillTone } from "@/components/shared/status-pill";
import type { ConversationStatus } from "@/lib/api/types";

const META: Record<ConversationStatus, { label: string; tone: PillTone; Icon: LucideIcon }> = {
  AI_HANDLING: { label: "AI", tone: "blue", Icon: Bot },
  WAITING_FOR_OWNER: { label: "Waiting", tone: "orange", Icon: Clock },
  WITH_OWNER: { label: "You", tone: "navy", Icon: User },
  RESOLVED: { label: "Resolved", tone: "green", Icon: CheckCircle2 },
};

/**
 * The one conversation status pill, used in list rows, the thread header, and
 * the info panel. `long` swaps the terse list label for a fuller phrase.
 */
export function ConversationStatusPill({
  status,
  long = false,
}: {
  status: ConversationStatus;
  long?: boolean;
}) {
  const { label, tone, Icon } = META[status];
  const longLabel: Record<ConversationStatus, string> = {
    AI_HANDLING: "Acroma AI",
    WAITING_FOR_OWNER: "Waiting for you",
    WITH_OWNER: "You're replying",
    RESOLVED: "Resolved",
  };
  return (
    <StatusPill tone={tone}>
      <Icon className="size-3" strokeWidth={2.25} />
      {long ? longLabel[status] : label}
    </StatusPill>
  );
}
