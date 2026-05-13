"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
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
          <p className="eyebrow text-muted-foreground">Outreach</p>
          <h1 className="font-display text-foreground mt-1 text-3xl font-medium tracking-tight">
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

      <section
        className="border-border/70 bg-card rounded-2xl border p-6"
        aria-label="Message"
      >
        <p className="eyebrow text-muted-foreground">Message</p>
        <p className="text-foreground mt-2 whitespace-pre-wrap text-sm leading-relaxed">
          {broadcast.bodyTemplate}
        </p>
        {broadcast.template ? (
          <p className="text-muted-foreground mt-3 text-xs">
            Template: {broadcast.template.name} ({broadcast.template.language})
          </p>
        ) : (
          <p className="text-muted-foreground mt-3 text-xs">
            In-window (free-text) send — only customers active in the last 24h.
          </p>
        )}
        {broadcast.discount ? (
          <p className="text-muted-foreground mt-1 text-xs">
            Discount code:{" "}
            <code className="font-mono">{broadcast.discount.code}</code>
          </p>
        ) : null}
      </section>

      <section
        className="border-border/70 bg-card grid grid-cols-2 gap-4 rounded-2xl border p-6 sm:grid-cols-4"
        aria-label="Counters"
      >
        <div>
          <p className="eyebrow text-muted-foreground">Sent</p>
          <p className="text-foreground mt-2 text-2xl font-medium tabular-nums">
            {broadcast.sentCount}
          </p>
        </div>
        <div>
          <p className="eyebrow text-muted-foreground">Delivered</p>
          <p className="text-foreground mt-2 text-2xl font-medium tabular-nums">
            {broadcast.deliveredCount}
          </p>
        </div>
        <div>
          <p className="eyebrow text-muted-foreground">Read</p>
          <p className="text-foreground mt-2 text-2xl font-medium tabular-nums">
            {broadcast.readCount}
          </p>
        </div>
        <div>
          <p className="eyebrow text-muted-foreground">Failed</p>
          <p className="text-foreground mt-2 text-2xl font-medium tabular-nums">
            {broadcast.failedCount}
          </p>
        </div>
      </section>
    </div>
  );
}
