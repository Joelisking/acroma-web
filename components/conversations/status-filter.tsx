"use client";

import * as React from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import type { ConversationStatus } from "@/lib/api/types";
import { cn } from "@/lib/utils";

type Filter = { value: ConversationStatus | "ALL"; label: string };

const FILTERS: Filter[] = [
  { value: "ALL", label: "All" },
  { value: "AI_HANDLING", label: "AI" },
  { value: "WAITING_FOR_OWNER", label: "Waiting" },
  { value: "WITH_OWNER", label: "You" },
  { value: "RESOLVED", label: "Resolved" },
];

export function StatusFilter() {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const current = params.get("status") ?? "ALL";

  function setStatus(value: Filter["value"]) {
    const next = new URLSearchParams(params);
    if (value === "ALL") next.delete("status");
    else next.set("status", value);
    router.replace(`${pathname}?${next.toString()}`, { scroll: false });
  }

  return (
    <div
      role="tablist"
      aria-label="Filter conversations by status"
      className="border-border/70 bg-card flex gap-1 overflow-x-auto rounded-full border p-1"
    >
      {FILTERS.map((f) => {
        const active = current === f.value;
        return (
          <button
            key={f.value}
            role="tab"
            aria-selected={active}
            onClick={() => setStatus(f.value)}
            className={cn(
              "rounded-full px-3 py-1.5 text-xs font-medium whitespace-nowrap transition-colors",
              active
                ? "bg-brand-orange text-primary-foreground"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            {f.label}
          </button>
        );
      })}
    </div>
  );
}
