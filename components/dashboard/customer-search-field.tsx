"use client";

import { useState, useTransition } from "react";
import { Search, X, Loader2 } from "lucide-react";
import { searchCustomersAction } from "@/lib/api/dashboard-actions";

type Option = { phone: string; name: string | null };

type Props = {
  value?: string;
  onChange: (phone: string | undefined) => void;
};

/**
 * Inline customer typeahead — an input with results rendered directly beneath
 * it (no nested popover), so it behaves like a normal form field inside the
 * filter sheet/popover and scrolls above the mobile keyboard instead of being
 * buried by it. A chosen customer collapses to a removable chip.
 */
export function CustomerSearchField({ value, onChange }: Props) {
  const [query, setQuery] = useState("");
  const [options, setOptions] = useState<Option[]>([]);
  const [label, setLabel] = useState<string | undefined>();
  const [pending, startTransition] = useTransition();

  function runSearch(search: string) {
    if (!search.trim()) {
      setOptions([]);
      return;
    }
    startTransition(async () => {
      const res = await searchCustomersAction(search);
      if (res.ok) setOptions(res.data);
    });
  }

  function clear() {
    onChange(undefined);
    setLabel(undefined);
    setQuery("");
    setOptions([]);
  }

  if (value) {
    return (
      <div className="border-border bg-card flex items-center justify-between gap-2 rounded-md border px-3 py-2">
        <span className="text-foreground truncate text-sm font-medium">
          {label ?? value}
        </span>
        <button
          type="button"
          onClick={clear}
          aria-label="Clear customer"
          className="text-muted-foreground hover:text-foreground shrink-0"
        >
          <X className="size-4" />
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div className="border-border bg-paper flex items-center gap-2 rounded-md border px-3 py-2">
        <Search className="text-muted-foreground size-4 shrink-0" />
        <input
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            runSearch(e.target.value);
          }}
          placeholder="Search customers"
          aria-label="Search customers"
          className="text-foreground placeholder:text-muted-foreground min-w-0 flex-1 bg-transparent text-sm outline-none"
        />
        {pending ? (
          <Loader2 className="text-muted-foreground size-4 shrink-0 animate-spin" />
        ) : null}
      </div>

      {query.trim() ? (
        <div className="border-border max-h-44 overflow-y-auto rounded-md border">
          {options.length === 0 ? (
            <p className="text-muted-foreground px-3 py-3 text-sm">
              {pending ? "Searching…" : "No matching customers."}
            </p>
          ) : (
            options.map((o) => (
              <button
                key={o.phone}
                type="button"
                onClick={() => {
                  onChange(o.phone);
                  setLabel(o.name ?? o.phone);
                }}
                className="hover:bg-accent/50 flex w-full flex-col items-start gap-0.5 border-b px-3 py-2.5 text-left last:border-b-0"
              >
                <span className="text-foreground truncate text-sm font-medium">
                  {o.name ?? o.phone}
                </span>
                {o.name ? (
                  <span className="text-muted-foreground text-xs tabular-nums">
                    {o.phone}
                  </span>
                ) : null}
              </button>
            ))
          )}
        </div>
      ) : null}
    </div>
  );
}
