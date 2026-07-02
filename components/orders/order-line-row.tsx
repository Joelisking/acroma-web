"use client";

import { X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { formatMoney } from "@/lib/format";
import type { Product } from "@/lib/api/types";
import { ProductLinePicker } from "./product-line-picker";

// One row's editable state. `key` is a client-only identity for React list
// rendering and is stripped before the cart is submitted to the backend.
export type EditableLine =
  | {
      key: string;
      kind: "catalog";
      productId: string;
      productName: string;
      variantId?: string;
      unitPrice: number;
      quantity: number;
    }
  | {
      key: string;
      kind: "custom";
      customName: string;
      unitPrice: number;
      quantity: number;
    };

type Props = {
  line: EditableLine;
  products: Product[];
  currency: string;
  onChange: (next: EditableLine) => void;
  onRemove: () => void;
};

export function OrderLineRow({
  line,
  products,
  currency,
  onChange,
  onRemove,
}: Props) {
  const lineTotal = line.unitPrice * line.quantity;
  // Derived fresh from `products` every render rather than stored on the
  // line, so it can never go stale relative to the catalog (e.g. a product
  // whose variants changed after this line was added).
  const catalogProduct =
    line.kind === "catalog"
      ? (products.find((p) => p.id === line.productId) ?? null)
      : null;
  const variants = catalogProduct?.variants ?? [];

  return (
    <div className="border-border/70 flex flex-col gap-2 rounded-xl border p-3">
      {line.kind === "catalog" ? (
        <>
          <ProductLinePicker
            products={products}
            value={line.productId || null}
            onChange={(product) =>
              onChange({
                ...line,
                productId: product.id,
                productName: product.name,
                variantId: undefined,
                unitPrice: product.basePrice,
              })
            }
          />
          {catalogProduct?.hasVariants ? (
            <Select
              value={line.variantId}
              onValueChange={(variantId) => {
                const variant = variants.find((v) => v.id === variantId);
                onChange({
                  ...line,
                  variantId,
                  unitPrice: variant?.priceOverride ?? line.unitPrice,
                });
              }}
            >
              <SelectTrigger className="h-11 w-full">
                <SelectValue placeholder="Choose a variant" />
              </SelectTrigger>
              <SelectContent>
                {variants.map((v) => (
                  <SelectItem key={v.id} value={v.id}>
                    {Object.entries(v.attributes)
                      .map(([k, val]) => `${k}: ${val}`)
                      .join(", ")}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          ) : null}
        </>
      ) : (
        <>
          <Input
            placeholder="Item name"
            aria-label="Item name"
            className="h-11"
            value={line.customName}
            onChange={(e) => onChange({ ...line, customName: e.target.value })}
          />
          <Input
            type="number"
            inputMode="decimal"
            step="0.01"
            min={0.01}
            placeholder="Price"
            aria-label="Unit price"
            className="h-11 tabular-nums"
            value={line.unitPrice || ""}
            onChange={(e) =>
              onChange({ ...line, unitPrice: Number(e.target.value) || 0 })
            }
          />
        </>
      )}

      <div className="flex items-center justify-between gap-3">
        <Input
          type="number"
          inputMode="numeric"
          min={1}
          step={1}
          aria-label="Quantity"
          className="h-9 w-20 tabular-nums"
          value={line.quantity}
          onChange={(e) =>
            onChange({ ...line, quantity: Math.max(1, Number(e.target.value) || 1) })
          }
        />
        <span className="text-muted-foreground text-sm tabular-nums">
          {formatMoney(lineTotal, currency)}
        </span>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="text-muted-foreground hover:text-destructive"
          onClick={onRemove}
          aria-label="Remove item"
        >
          <X className="size-4" />
        </Button>
      </div>
    </div>
  );
}
