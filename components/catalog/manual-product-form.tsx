"use client";

import * as React from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { ProductTagsPicker } from "@/components/catalog/product-tags-picker";
import type { BusinessType, ProductFormValues } from "@/lib/api/types";

type Props = {
  values: ProductFormValues;
  onChange: (next: ProductFormValues) => void;
  /**
   * Drives whether the dietary / allergen tag picker starts expanded.
   * Food merchants get it expanded by default; everyone else still has
   * access via the collapsible header.
   */
  businessType?: BusinessType | null;
};

/**
 * Controlled create-mode product form. Image upload, save, and variants
 * live on the parent page; this component only renders the scalar fields.
 */
export function ManualProductForm({ values, onChange, businessType }: Props) {
  function set<K extends keyof ProductFormValues>(
    key: K,
    value: ProductFormValues[K],
  ) {
    onChange({ ...values, [key]: value });
  }

  return (
    <div className="space-y-5">
      <div className="space-y-1.5">
        <Label htmlFor="product-name">Name</Label>
        <Input
          id="product-name"
          className="h-11"
          autoFocus
          value={values.name}
          onChange={(e) => set("name", e.target.value)}
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="product-description">Description</Label>
        <textarea
          id="product-description"
          rows={3}
          className="border-input bg-background hover:bg-muted/50 focus-visible:border-ring focus-visible:ring-ring/40 placeholder:text-muted-foreground min-h-[80px] w-full resize-y rounded-md border px-3 py-2 text-sm transition-colors focus-visible:ring-2 focus-visible:outline-none"
          value={values.description}
          onChange={(e) => set("description", e.target.value)}
        />
      </div>

      <div className="grid gap-5 sm:grid-cols-3">
        <div className="space-y-1.5">
          <Label htmlFor="product-price">Price</Label>
          <Input
            id="product-price"
            type="number"
            inputMode="decimal"
            step="0.01"
            min={0}
            className="h-11 tabular-nums"
            value={values.basePrice}
            onChange={(e) => set("basePrice", e.target.value)}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="product-stock">Stock</Label>
          <Input
            id="product-stock"
            type="number"
            inputMode="numeric"
            min={0}
            className="h-11 tabular-nums"
            value={values.stock}
            onChange={(e) => set("stock", e.target.value)}
            disabled={values.hasVariants}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="product-category">Category</Label>
          <Input
            id="product-category"
            className="h-11"
            placeholder="Optional"
            value={values.category}
            onChange={(e) => set("category", e.target.value)}
          />
        </div>
      </div>

      <div className="border-border/70 bg-muted/30 flex items-center justify-between rounded-xl border p-4">
        <div>
          <Label htmlFor="product-has-variants">
            Has options (size, color, etc.)
          </Label>
          <p className="text-muted-foreground text-xs">
            Turn on to manage stock and price per option.
          </p>
        </div>
        <input
          id="product-has-variants"
          type="checkbox"
          className="size-5 accent-[var(--brand-orange)]"
          checked={values.hasVariants}
          onChange={(e) => {
            const checked = e.target.checked;
            onChange({
              ...values,
              hasVariants: checked,
              variantDimensions:
                checked && values.variantDimensions.length === 0
                  ? [{ name: "", options: [] }]
                  : values.variantDimensions,
              variants: checked ? values.variants : [],
            });
          }}
        />
      </div>

      <ProductTagsPicker
        value={values.tags}
        onChange={(tags) => set("tags", tags)}
        expandedByDefault={businessType === "FOOD_BEVERAGES"}
      />

      <div className="border-border/70 bg-muted/30 flex items-center justify-between rounded-xl border p-4">
        <div>
          <Label htmlFor="product-active">Visible to customers</Label>
          <p className="text-muted-foreground text-xs">
            Hidden products won&apos;t appear in AI replies or menus.
          </p>
        </div>
        <input
          id="product-active"
          type="checkbox"
          className="size-5 accent-[var(--brand-orange)]"
          checked={values.isActive}
          onChange={(e) => set("isActive", e.target.checked)}
        />
      </div>
    </div>
  );
}
