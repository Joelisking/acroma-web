"use client";

import * as React from "react";
import { ChevronDown, History } from "lucide-react";

import type { AuditActor, AuditEntry } from "@/lib/api/types";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

type ActivityTimelineProps = {
  entries: AuditEntry[];
  className?: string;
};

const TIME_FORMAT: Intl.DateTimeFormatOptions = {
  day: "numeric",
  month: "short",
  hour: "numeric",
  minute: "2-digit",
  hour12: true,
};

// Friendly labels for the event types the backend currently emits. Unknown
// types fall back to a readable form so new backend events don't break the UI.
const EVENT_LABELS: Record<string, string> = {
  "ai.action": "AI action",
  "ai.escalate": "AI escalated",
  "conversation.resolve": "Marked resolved",
  "conversation.handoff": "Hand-off",
  "order.status": "Order status",
};

const ACTOR_LABELS: Record<AuditActor, string> = {
  CUSTOMER: "Customer",
  AI: "Acroma AI",
  OWNER: "You",
  SYSTEM: "System",
};

const ACTOR_VARIANTS: Record<
  AuditActor,
  React.ComponentProps<typeof Badge>["variant"]
> = {
  CUSTOMER: "secondary",
  AI: "default",
  OWNER: "outline",
  SYSTEM: "ghost",
};

/**
 * Read-only Activity timeline for a single conversation, fed by the audit
 * log. A debugging aid for the merchant: newest first, each entry shows time,
 * actor, a friendly event label, the summary, and an expandable raw `detail`.
 */
export function ActivityTimeline({
  entries,
  className,
}: ActivityTimelineProps) {
  return (
    <Collapsible className={cn("border-t", className)}>
      <CollapsibleTrigger className="group/activity text-muted-foreground hover:text-foreground flex w-full items-center justify-between gap-2 px-1 py-3 text-sm font-medium transition-colors focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none">
        <span className="flex items-center gap-2">
          <History className="size-4" aria-hidden="true" />
          Activity
          {entries.length > 0 ? (
            <span className="text-muted-foreground/70 text-xs font-normal">
              ({entries.length})
            </span>
          ) : null}
        </span>
        <ChevronDown
          className="size-4 transition-transform group-data-[state=open]/activity:rotate-180"
          aria-hidden="true"
        />
      </CollapsibleTrigger>

      <CollapsibleContent className="pb-4">
        {entries.length === 0 ? (
          <p className="text-muted-foreground px-1 py-2 text-sm">
            No activity yet.
          </p>
        ) : (
          <ol className="flex flex-col gap-3 pt-1">
            {entries.map((entry) => (
              <ActivityRow key={entry.id} entry={entry} />
            ))}
          </ol>
        )}
      </CollapsibleContent>
    </Collapsible>
  );
}

function ActivityRow({ entry }: { entry: AuditEntry }) {
  const label = EVENT_LABELS[entry.eventType] ?? humanize(entry.eventType);
  const hasDetail =
    entry.detail !== null &&
    entry.detail !== undefined &&
    !(typeof entry.detail === "object" &&
      Object.keys(entry.detail as object).length === 0);

  return (
    <li className="border-border/60 bg-card flex flex-col gap-1 rounded-md border px-3 py-2">
      <div className="flex flex-wrap items-center gap-2">
        <Badge variant={ACTOR_VARIANTS[entry.actor]}>
          {ACTOR_LABELS[entry.actor] ?? entry.actor}
        </Badge>
        <span className="text-foreground text-sm font-medium">{label}</span>
        <time
          dateTime={entry.createdAt}
          className="text-muted-foreground ml-auto text-xs"
        >
          {new Date(entry.createdAt).toLocaleString(undefined, TIME_FORMAT)}
        </time>
      </div>

      {entry.summary ? (
        <p className="text-muted-foreground text-sm">{entry.summary}</p>
      ) : null}

      {hasDetail ? <DetailDisclosure detail={entry.detail} /> : null}
    </li>
  );
}

function DetailDisclosure({ detail }: { detail: unknown }) {
  return (
    <Collapsible className="mt-1">
      <CollapsibleTrigger className="group/detail text-muted-foreground hover:text-foreground flex items-center gap-1 text-xs font-medium transition-colors focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none">
        <ChevronDown
          className="size-3 transition-transform group-data-[state=open]/detail:rotate-180"
          aria-hidden="true"
        />
        Details
      </CollapsibleTrigger>
      <CollapsibleContent>
        <pre className="bg-muted text-muted-foreground mt-1 overflow-x-auto rounded-md p-2 font-mono text-xs whitespace-pre-wrap">
          {prettyPrint(detail)}
        </pre>
      </CollapsibleContent>
    </Collapsible>
  );
}

function prettyPrint(detail: unknown): string {
  try {
    return JSON.stringify(detail, null, 2);
  } catch {
    return String(detail);
  }
}

function humanize(eventType: string): string {
  return eventType
    .split(/[.\-_]/)
    .filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}
