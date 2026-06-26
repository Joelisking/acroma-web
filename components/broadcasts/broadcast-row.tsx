import Link from "next/link";
import { ChevronRight, Megaphone } from "lucide-react";
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
      className="card-calm hover:border-brand-orange/40 flex items-center gap-3 p-3.5 transition-colors"
    >
      <span className="bg-brand-green-soft text-brand-green flex size-10 shrink-0 items-center justify-center rounded-xl">
        <Megaphone className="size-5" strokeWidth={2} />
      </span>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <p className="text-foreground truncate text-[0.95rem] font-semibold">
            {broadcast.name}
          </p>
          <BroadcastStatusBadge status={broadcast.status} />
        </div>
        <p className="text-muted-foreground mt-0.5 truncate text-xs">
          {BUCKET_LABELS[broadcast.audienceBucket]} &middot;{" "}
          {broadcast.totalRecipients} recipients &middot; {broadcast.sentCount}{" "}
          sent &middot; {broadcast.readCount} read
        </p>
      </div>
      <ChevronRight className="text-muted-foreground/50 size-4 shrink-0" />
    </Link>
  );
}
