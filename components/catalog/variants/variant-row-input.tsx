"use client";

import * as React from "react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { useVocab } from "@/components/vocabulary-provider";

type VariantRow = {
  attributes: Record<string, string>;
  stock: number;
  priceOverride: number | null;
  isActive: boolean;
};

type VariantRowInputProps = {
  row: VariantRow;
  basePrice: number;
  onChange: (next: VariantRow) => void;
};

function toNumberOrNull(v: string): number | null {
  if (v.trim() === "") return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}

function toIntOrZero(v: string): number {
  if (v.trim() === "") return 0;
  const n = parseInt(v, 10);
  return Number.isFinite(n) ? Math.max(0, n) : 0;
}

export function VariantRowInput({
  row,
  basePrice,
  onChange,
}: VariantRowInputProps) {
  const vocab = useVocab();
  const label = Object.entries(row.attributes)
    .map(([k, v]) => `${k}: ${v}`)
    .join(" · ");

  return (
    <div
      className={cn(
        "border-border/70 grid grid-cols-1 items-center gap-3 border-b px-4 py-3 last:border-b-0",
        vocab.tracksStock
          ? "sm:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)_minmax(0,1fr)_auto]"
          : "sm:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)_auto]",
        !row.isActive && "opacity-60",
      )}
    >
      <p className="text-foreground truncate text-sm font-medium">{label}</p>

      {vocab.tracksStock ? (
        <div>
          <span className="text-muted-foreground sm:hidden text-[0.65rem]">
            Stock
          </span>
          <Input
            type="number"
            min={0}
            value={row.stock}
            onChange={(e) =>
              onChange({ ...row, stock: toIntOrZero(e.target.value) })
            }
            className="h-9 tabular-nums"
          />
        </div>
      ) : null}

      <div>
        <span className="text-muted-foreground sm:hidden text-[0.65rem]">
          Price (override)
        </span>
        <Input
          type="number"
          step="0.01"
          min={0}
          placeholder={`base ${basePrice}`}
          value={row.priceOverride ?? ""}
          onChange={(e) =>
            onChange({
              ...row,
              priceOverride: toNumberOrNull(e.target.value),
            })
          }
          className="h-9 tabular-nums"
        />
      </div>

      <label className="text-muted-foreground inline-flex items-center gap-2 text-xs">
        <input
          type="checkbox"
          className="size-4 accent-[var(--brand-orange)]"
          checked={row.isActive}
          onChange={(e) =>
            onChange({ ...row, isActive: e.target.checked })
          }
        />
        Active
      </label>
    </div>
  );
}

export type { VariantRow };
