import { StatusPill, type PillTone } from "@/components/shared/status-pill";
import type { BroadcastStatus } from "@/lib/api/types";

const STYLES: Record<BroadcastStatus, { label: string; tone: PillTone }> = {
  DRAFT: { label: "Draft", tone: "muted" },
  QUEUED: { label: "Queued", tone: "blue" },
  SENDING: { label: "Sending", tone: "blue" },
  SENT: { label: "Sent", tone: "green" },
  FAILED: { label: "Failed", tone: "destructive" },
};

export function BroadcastStatusBadge({ status }: { status: BroadcastStatus }) {
  const s = STYLES[status];
  return <StatusPill tone={s.tone}>{s.label}</StatusPill>;
}
