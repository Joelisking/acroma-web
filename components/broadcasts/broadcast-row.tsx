import { Megaphone } from "lucide-react";
import type { Broadcast } from "@/lib/api/types";
import { ListRow } from "@/components/shared/list-row";
import { BroadcastStatusBadge } from "./status-badge";

const BUCKET_LABELS: Record<Broadcast["audienceBucket"], string> = {
  ALL_CUSTOMERS: "All customers",
  ACTIVE_LAST_30_DAYS: "Active 30 days",
  ACTIVE_LAST_90_DAYS: "Active 90 days",
  IN_24H_WINDOW: "24-hour window",
};

export function BroadcastRow({ broadcast }: { broadcast: Broadcast }) {
  return (
    <ListRow
      className="card-warm"
      href={`/dashboard/broadcasts/${broadcast.id}`}
      showChevron
      leading={
        <span className="bg-brand-green-soft text-brand-green flex size-10 items-center justify-center rounded-xl">
          <Megaphone className="size-5" strokeWidth={2} />
        </span>
      }
      title={
        <span className="flex items-center gap-2">
          <span className="truncate">{broadcast.name}</span>
          <BroadcastStatusBadge status={broadcast.status} />
        </span>
      }
      subtitle={
        <>
          {BUCKET_LABELS[broadcast.audienceBucket]} &middot;{" "}
          {broadcast.totalRecipients} recipients &middot; {broadcast.sentCount}{" "}
          sent &middot; {broadcast.readCount} read
        </>
      }
    />
  );
}
