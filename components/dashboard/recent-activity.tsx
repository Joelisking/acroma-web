import Link from "next/link";
import { Inbox, MessageSquare, ShoppingBag } from "lucide-react";

import { formatRelativeShort } from "@/lib/format";
import type { ActivityItem } from "@/lib/dashboard-metrics";
import { cn } from "@/lib/utils";

type Props = { items: ActivityItem[] };

export function RecentActivity({ items }: Props) {
  return (
    <section
      className="border-border/70 bg-card rounded-2xl border p-6"
      aria-labelledby="recent-activity-heading"
    >
      <div className="flex items-center justify-between">
        <h3
          id="recent-activity-heading"
          className="text-foreground text-sm font-semibold"
        >
          Recent activity
        </h3>
        <span className="text-muted-foreground text-xs">Live</span>
      </div>

      {items.length === 0 ? <EmptyState /> : <ActivityList items={items} />}
    </section>
  );
}

function ActivityList({ items }: { items: ActivityItem[] }) {
  return (
    <ul className="divide-border/70 mt-4 divide-y">
      {items.map((item) => (
        <li key={`${item.kind}-${item.id}`}>
          <Link
            href={item.href}
            className="hover:bg-muted/30 -mx-2 flex items-center gap-3 rounded-lg px-2 py-3 transition-colors"
          >
            <ActivityIcon kind={item.kind} />
            <div className="min-w-0 flex-1">
              <p className="text-foreground truncate text-sm font-medium">
                {item.title}
              </p>
              <p className="text-muted-foreground truncate text-xs">
                {item.subtitle}
              </p>
            </div>
            <time
              className="text-muted-foreground shrink-0 text-xs tabular-nums"
              dateTime={item.timestamp}
            >
              {formatRelativeShort(item.timestamp)}
            </time>
          </Link>
        </li>
      ))}
    </ul>
  );
}

function ActivityIcon({ kind }: { kind: ActivityItem["kind"] }) {
  const isOrder = kind === "order";
  const Icon = isOrder ? ShoppingBag : MessageSquare;
  return (
    <span
      className={cn(
        "flex size-9 shrink-0 items-center justify-center rounded-xl",
        isOrder
          ? "bg-brand-blue-soft text-brand-blue"
          : "bg-brand-orange-soft text-brand-orange",
      )}
    >
      <Icon className="size-4" strokeWidth={1.75} />
    </span>
  );
}

function EmptyState() {
  return (
    <div className="border-border/70 mt-6 flex flex-col items-center justify-center rounded-xl border border-dashed py-14 text-center">
      <span className="bg-brand-orange-soft text-brand-orange flex size-12 items-center justify-center rounded-2xl">
        <Inbox className="size-5" strokeWidth={1.75} />
      </span>
      <p className="text-foreground font-display mt-4 text-lg font-medium">
        Quiet for now.
      </p>
      <p className="text-muted-foreground mt-1 max-w-xs text-sm">
        New conversations and orders will appear here the moment they happen.
      </p>
    </div>
  );
}
