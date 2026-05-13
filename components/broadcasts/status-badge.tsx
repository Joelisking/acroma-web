import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { BroadcastStatus } from "@/lib/api/types";

const STYLES: Record<BroadcastStatus, { label: string; className: string }> = {
  DRAFT: { label: "Draft", className: "bg-muted text-muted-foreground" },
  QUEUED: { label: "Queued", className: "bg-brand-blue-soft text-brand-blue" },
  SENDING: { label: "Sending", className: "bg-brand-blue-soft text-brand-blue" },
  SENT: { label: "Sent", className: "bg-brand-green-soft text-brand-green" },
  FAILED: { label: "Failed", className: "bg-destructive/10 text-destructive" },
};

export function BroadcastStatusBadge({ status }: { status: BroadcastStatus }) {
  const s = STYLES[status];
  return <Badge className={cn("text-xs", s.className)}>{s.label}</Badge>;
}
