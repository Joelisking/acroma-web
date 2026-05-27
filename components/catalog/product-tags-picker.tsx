"use client";

import * as React from "react";
import { ChevronDown } from "lucide-react";

import { cn } from "@/lib/utils";
import { TAG_OPTIONS } from "@/lib/catalog/product-tags";
import type { ProductTag } from "@/lib/api/types";

type Props = {
  value: ProductTag[];
  onChange: (next: ProductTag[]) => void;
  /**
   * When `false` the picker is collapsed by default. Food merchants get
   * it expanded; retail merchants keep their product form uncluttered
   * but can still expand and tag items if they want to.
   */
  expandedByDefault?: boolean;
  className?: string;
};

function toggle(list: ProductTag[], tag: ProductTag): ProductTag[] {
  return list.includes(tag) ? list.filter((t) => t !== tag) : [...list, tag];
}

export function ProductTagsPicker({
  value,
  onChange,
  expandedByDefault = false,
  className,
}: Props) {
  const [open, setOpen] = React.useState(expandedByDefault || value.length > 0);

  return (
    <div
      className={cn(
        "border-border/70 bg-muted/30 rounded-xl border p-4",
        className,
      )}
    >
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between text-left"
        aria-expanded={open}
      >
        <div>
          <p className="text-sm font-medium">Dietary &amp; allergen tags</p>
          <p className="text-muted-foreground text-xs">
            Optional. The AI uses these to answer customer questions like
            &quot;is this halal?&quot; or &quot;is it vegetarian?&quot;.
          </p>
        </div>
        <ChevronDown
          className={cn(
            "text-muted-foreground size-4 transition-transform",
            open ? "rotate-180" : "rotate-0",
          )}
        />
      </button>

      {open ? (
        <div className="mt-4 flex flex-wrap gap-2">
          {TAG_OPTIONS.map((opt) => {
            const selected = value.includes(opt.value);
            return (
              <button
                key={opt.value}
                type="button"
                onClick={() => onChange(toggle(value, opt.value))}
                aria-pressed={selected}
                className={cn(
                  "focus-visible:ring-ring/40 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors",
                  "focus-visible:ring-2 focus-visible:outline-none",
                  selected
                    ? "bg-brand-blue-soft text-brand-blue border-brand-blue/30"
                    : "border-border bg-background text-foreground hover:bg-muted",
                )}
              >
                {opt.label}
              </button>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}

