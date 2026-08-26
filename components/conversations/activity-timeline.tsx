"use client";

import { ChevronDown, History } from "lucide-react";

import type { AuditActor, AuditEntry } from "@/lib/api/types";
import { cn } from "@/lib/utils";
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

// Friendly one-line labels for the event types the backend emits. Unknown
// types fall back to a humanised form so new events still read cleanly.
const EVENT_LABELS: Record<string, string> = {
  "ai.action": "Acroma acted",
  "ai.escalate": "Flagged for you",
  "conversation.resolve": "Marked resolved",
  "conversation.handoff": "Handed over",
  "order.status": "Order updated",
};

const ACTOR_LABELS: Record<AuditActor, string> = {
  CUSTOMER: "Customer",
  AI: "Acroma AI",
  OWNER: "You",
  STAFF: "Worker",
  SYSTEM: "System",
};

const ACTOR_DOT: Record<AuditActor, string> = {
  CUSTOMER: "bg-muted-foreground/50",
  AI: "bg-brand-blue",
  OWNER: "bg-brand-orange",
  STAFF: "bg-brand-green",
  SYSTEM: "bg-muted-foreground/50",
};

/**
 * Read-only activity for a single conversation, fed by the audit log. A compact
 * vertical timeline (newest first): a coloured dot per actor, a friendly label,
 * and who did it + when. Collapsed by default so it never dominates the panel.
 */
export function ActivityTimeline({ entries, className }: ActivityTimelineProps) {
  return (
    <Collapsible className={cn("border-t", className)}>
      <CollapsibleTrigger className="group/activity text-muted-foreground hover:text-foreground focus-visible:ring-ring flex w-full items-center justify-between gap-2 px-1 py-3 text-sm font-medium transition-colors focus-visible:ring-2 focus-visible:outline-none">
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

      <CollapsibleContent className="pb-2">
        {entries.length === 0 ? (
          <p className="text-muted-foreground px-1 py-2 text-sm">No activity yet.</p>
        ) : (
          <ol className="px-1 pt-1">
            {entries.map((entry, i) => (
              <ActivityRow
                key={entry.id}
                entry={entry}
                last={i === entries.length - 1}
              />
            ))}
          </ol>
        )}
      </CollapsibleContent>
    </Collapsible>
  );
}

function ActivityRow({ entry, last }: { entry: AuditEntry; last: boolean }) {
  const label = describe(entry);
  return (
    <li className="flex gap-3">
      <div className="flex flex-col items-center">
        <span className={cn("mt-1.5 size-2.5 shrink-0 rounded-full", ACTOR_DOT[entry.actor])} />
        {!last ? <span className="bg-border my-1 w-px flex-1" /> : null}
      </div>
      <div className="min-w-0 flex-1 pb-4">
        <p className="text-foreground text-sm font-medium">{label}</p>
        <p className="text-muted-foreground text-xs">
          {entry.actorName ?? ACTOR_LABELS[entry.actor] ?? entry.actor} ·{" "}
          {new Date(entry.createdAt).toLocaleString(undefined, TIME_FORMAT)}
        </p>
      </div>
    </li>
  );
}

/**
 * A short, human label for an entry. Prefers the specific action carried in
 * `summary` (e.g. REPLY, CREATE_ORDER) over the generic event type.
 */
function describe(entry: AuditEntry): string {
  const summary = entry.summary?.trim();
  if (summary && /^[A-Z0-9_]+$/.test(summary)) return humanize(summary);
  if (summary) return summary;
  return EVENT_LABELS[entry.eventType] ?? humanize(entry.eventType);
}

function humanize(value: string): string {
  const words = value
    .split(/[.\-_]/)
    .filter(Boolean)
    .map((w) => w.toLowerCase());
  if (words.length === 0) return value;
  const [first, ...rest] = words;
  return [first.charAt(0).toUpperCase() + first.slice(1), ...rest].join(" ");
}
