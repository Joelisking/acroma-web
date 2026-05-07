"use client";

import { VariantRowInput, type VariantRow } from "./variant-row-input";

type VariantGridProps = {
  rows: VariantRow[];
  basePrice: number;
  onChange: (rows: VariantRow[]) => void;
};

export function VariantGrid({ rows, basePrice, onChange }: VariantGridProps) {
  if (rows.length === 0) {
    return (
      <p className="text-muted-foreground rounded-xl border border-dashed border-border/70 bg-card p-6 text-center text-sm">
        Add at least one option to every dimension to generate the variant grid.
      </p>
    );
  }

  return (
    <div className="border-border/70 bg-card overflow-hidden rounded-2xl border">
      <header className="border-border/70 bg-muted/40 hidden grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)_minmax(0,1fr)_auto] gap-3 border-b px-4 py-2.5 text-[0.7rem] font-semibold uppercase tracking-wider text-muted-foreground sm:grid">
        <span>Variant</span>
        <span>Stock</span>
        <span>Price (override)</span>
        <span>Active</span>
      </header>
      {rows.map((row, idx) => (
        <VariantRowInput
          key={idx}
          row={row}
          basePrice={basePrice}
          onChange={(next) =>
            onChange(rows.map((r, i) => (i === idx ? next : r)))
          }
        />
      ))}
    </div>
  );
}
