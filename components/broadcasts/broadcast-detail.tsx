"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { SectionCard } from "@/components/shared/section-card";
import { StatChip } from "@/components/shared/stat-chip";
import { BroadcastStatusBadge } from "./status-badge";
import {
  cancelBroadcastAction,
  enqueueBroadcastAction,
} from "@/lib/api/broadcasts-actions";
import type { Broadcast } from "@/lib/api/types";

const BUCKET_LABELS: Record<Broadcast["audienceBucket"], string> = {
  ALL_CUSTOMERS: "All customers",
  ACTIVE_LAST_30_DAYS: "Active in last 30 days",
  ACTIVE_LAST_90_DAYS: "Active in last 90 days",
  IN_24H_WINDOW: "24-hour service window",
};

export function BroadcastDetail({ broadcast }: { broadcast: Broadcast }) {
  const router = useRouter();
  const [pending, startTransition] = React.useTransition();

  const canSend = broadcast.status === "DRAFT";
  const canCancel =
    broadcast.status === "QUEUED" || broadcast.status === "SENDING";

  function onSend() {
    startTransition(async () => {
      const result = await enqueueBroadcastAction(broadcast.id);
      if (!result.ok) toast.error(result.error);
      else toast.success("Broadcast queued");
      router.refresh();
    });
  }

  function onCancel() {
    startTransition(async () => {
      const result = await cancelBroadcastAction(broadcast.id);
      if (!result.ok) toast.error(result.error);
      else toast.success("Broadcast cancelled");
      router.refresh();
    });
  }

  return (
    <div className="space-y-6">
      <header className="flex items-start justify-between gap-4">
        <div>
          <p className="text-muted-foreground text-xs font-bold tracking-widest uppercase">
            Outreach
          </p>
          <h1 className="text-foreground mt-1 text-3xl font-bold tracking-tight">
            {broadcast.name}
          </h1>
          <div className="text-muted-foreground mt-2 flex flex-wrap items-center gap-3 text-sm">
            <BroadcastStatusBadge status={broadcast.status} />
            <span>{BUCKET_LABELS[broadcast.audienceBucket]}</span>
            <span>·</span>
            <span>{broadcast.totalRecipients} recipients</span>
          </div>
        </div>
        <div className="flex gap-2">
          {canCancel ? (
            <Button variant="outline" onClick={onCancel} disabled={pending}>
              Cancel
            </Button>
          ) : null}
          {canSend ? (
            <Button onClick={onSend} disabled={pending}>
              Send now
            </Button>
          ) : null}
        </div>
      </header>

      <SectionCard title="Message">
        <p className="text-foreground whitespace-pre-wrap text-sm leading-relaxed">
          {broadcast.bodyTemplate}
        </p>
        {broadcast.template ? (
          <p className="text-muted-foreground mt-3 text-xs">
            Template: {broadcast.template.name} ({broadcast.template.language})
          </p>
        ) : (
          <p className="text-muted-foreground mt-3 text-xs">
            In-window (free-text) send. Only customers active in the last 24h.
          </p>
        )}
        {broadcast.discount ? (
          <p className="text-muted-foreground mt-1 text-xs">
            Discount code:{" "}
            <code className="font-mono">{broadcast.discount.code}</code>
          </p>
        ) : null}
      </SectionCard>

      <section
        className="grid grid-cols-2 gap-3 sm:grid-cols-4"
        aria-label="Counters"
      >
        <StatChip label="Sent" value={String(broadcast.sentCount)} />
        <StatChip label="Delivered" value={String(broadcast.deliveredCount)} />
        <StatChip label="Read" value={String(broadcast.readCount)} />
        <StatChip label="Failed" value={String(broadcast.failedCount)} />
      </section>
    </div>
  );
}
