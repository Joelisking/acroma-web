import Link from "next/link";
import type { Broadcast } from "@/lib/api/types";
import { BroadcastStatusBadge } from "./status-badge";

const BUCKET_LABELS: Record<Broadcast["audienceBucket"], string> = {
  ALL_CUSTOMERS: "All customers",
  ACTIVE_LAST_30_DAYS: "Active 30 days",
  ACTIVE_LAST_90_DAYS: "Active 90 days",
  IN_24H_WINDOW: "24-hour window",
};

export function BroadcastRow({ broadcast }: { broadcast: Broadcast }) {
  return (
    <Link
      href={`/dashboard/broadcasts/${broadcast.id}`}
      className="border-border/70 bg-card hover:bg-accent grid grid-cols-[1fr_auto] items-center gap-3 rounded-xl border px-4 py-3 transition-colors"
    >
      <div className="min-w-0">
        <div className="flex items-center gap-2">
          <p className="text-foreground truncate text-sm font-medium">
            {broadcast.name}
          </p>
          <BroadcastStatusBadge status={broadcast.status} />
        </div>
        <p className="text-muted-foreground mt-1 text-xs">
          {BUCKET_LABELS[broadcast.audienceBucket]} &middot; {broadcast.totalRecipients} recipients &middot; {broadcast.sentCount} sent &middot; {broadcast.readCount} read
        </p>
      </div>
    </Link>
  );
}
