"use client";

import type { FaqEntry } from "@/lib/api/faq";
import { FAQ_CATEGORY_META } from "./categories";
import { FaqRow } from "./faq-row";

type CategoryGroupProps = {
  category: FaqEntry["category"];
  entries: FaqEntry[];
  onChange: (entry: FaqEntry) => void;
  onRemove: (id: string) => void;
};

export function CategoryGroup({
  category,
  entries,
  onChange,
  onRemove,
}: CategoryGroupProps) {
  if (entries.length === 0) return null;
  const meta = FAQ_CATEGORY_META[category];
  const Icon = meta.icon;
  const activeCount = entries.filter((e) => e.active).length;

  return (
    <section>
      <div className="mb-3 flex items-center gap-2">
        <span className="bg-brand-blue-soft text-brand-blue inline-flex size-7 items-center justify-center rounded-lg">
          <Icon className="size-4" strokeWidth={1.75} />
        </span>
        <h3 className="text-foreground text-sm font-semibold">{meta.label}</h3>
        <span className="text-muted-foreground text-xs">
          {activeCount}/{entries.length} on
        </span>
      </div>
      <div className="space-y-3">
        {entries.map((entry) => (
          <FaqRow
            key={entry.id}
            entry={entry}
            onChange={onChange}
            onRemove={onRemove}
          />
        ))}
      </div>
    </section>
  );
}
