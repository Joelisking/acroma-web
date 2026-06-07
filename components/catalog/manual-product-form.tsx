"use client";

import * as React from "react";
import { Clock } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { ProductTagsPicker } from "@/components/catalog/product-tags-picker";
import { CategoryCombobox } from "@/components/catalog/category-combobox";
import type { BusinessType, ProductFormValues } from "@/lib/api/types";
import { getVocabulary } from "@/lib/vocabulary";

type Props = {
  values: ProductFormValues;
  onChange: (next: ProductFormValues) => void;
  /**
   * Food merchants get the dietary picker expanded by default and no Stock
   * field (they use the "sold out today, resets tomorrow" model instead of
   * stock counts).
   */
  businessType?: BusinessType | null;
  /** Existing categories to offer in the category combobox. */
  categories?: string[];
};

/**
 * Controlled create-mode form. Image upload, save, and variants live on the
 * parent page; this renders the scalar fields, grouped in a warm card.
 */
export function ManualProductForm({
  values,
  onChange,
  businessType,
  categories = [],
}: Props) {
  const isFood = businessType === "FOOD_BEVERAGES";
  const isServices = businessType === "SERVICES";
  const tracksStock = getVocabulary(businessType).tracksStock;

  function set<K extends keyof ProductFormValues>(
    key: K,
    value: ProductFormValues[K],
  ) {
    onChange({ ...values, [key]: value });
  }

  return (
    <div className="space-y-5">
      <div className="card-warm space-y-5 p-4 sm:p-5">
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

        <div
          className={
            isFood ? "grid gap-5 sm:grid-cols-2" : "grid gap-5 sm:grid-cols-3"
          }
        >
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

          {tracksStock ? (
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
          ) : null}

          <div className="space-y-1.5">
            <Label htmlFor="product-category">Category</Label>
            <CategoryCombobox
              id="product-category"
              value={values.category}
              onChange={(c) => set("category", c)}
              categories={categories}
            />
          </div>

          {isServices ? (
            <div className="space-y-1.5">
              <Label htmlFor="product-duration">Duration (minutes)</Label>
              <Input
                id="product-duration"
                type="number"
                inputMode="numeric"
                min={0}
                placeholder="e.g. 45"
                className="h-11 tabular-nums"
                value={values.estimatedDurationMinutes}
                onChange={(e) => set("estimatedDurationMinutes", e.target.value)}
              />
            </div>
          ) : null}
        </div>
      </div>

      <div className="border-border/70 bg-muted/30 flex items-center justify-between rounded-xl border p-4">
        <div>
          <Label htmlFor="product-has-variants">
            {isFood
              ? "Comes in sizes or extras"
              : "Has options (size, color, etc.)"}
          </Label>
          <p className="text-muted-foreground text-xs">
            {isFood
              ? "e.g. full or half, extra protein. Set a price per option."
              : "Turn on to manage stock and price per option."}
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
        expandedByDefault={isFood}
      />

      <div className="border-border/70 bg-muted/30 flex items-center justify-between rounded-xl border p-4">
        <div>
          <Label htmlFor="product-active">Visible to customers</Label>
          <p className="text-muted-foreground text-xs">
            Hidden items won&apos;t appear in AI replies or menus.
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

      {isFood ? (
        <div className="text-muted-foreground flex items-start gap-2 px-1">
          <Clock className="mt-0.5 size-3.5 shrink-0" strokeWidth={2} />
          <p className="text-xs leading-relaxed">
            When a dish runs out, mark it{" "}
            <strong className="text-brand-navy">sold out</strong> from your menu.
            It comes back automatically tomorrow, no stock counts to keep.
          </p>
        </div>
      ) : null}
    </div>
  );
}
