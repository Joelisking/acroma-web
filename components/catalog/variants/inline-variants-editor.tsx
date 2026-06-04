"use client";

import * as React from "react";
import type {
  ProductFormValues,
  VariantDimension,
} from "@/lib/api/types";
import { cartesianAttributes, attributesKey } from "@/lib/cartesian";
import { DimensionEditor } from "@/components/catalog/variants/dimension-editor";
import { VariantGrid } from "@/components/catalog/variants/variant-grid";
import type { VariantRow } from "@/components/catalog/variants/variant-row-input";
import { useVocab } from "@/components/vocabulary-provider";

type Props = {
  values: ProductFormValues;
  onChange: (next: ProductFormValues) => void;
};

/**
 * Form-state-driven variants editor used on the new-product page.
 * Wraps the same DimensionEditor + VariantGrid the post-create editor uses,
 * but reads/writes `ProductFormValues.variantDimensions` and
 * `ProductFormValues.variants` directly. As dimensions change, rows are
 * re-generated via cartesian, preserving any stock/priceOverride/isActive
 * the merchant has already set on rows whose attribute keys still exist.
 */
export function InlineVariantsEditor({ values, onChange }: Props) {
  const vocab = useVocab();

  const basePriceNumber = React.useMemo(() => {
    const n = Number(values.basePrice);
    return Number.isFinite(n) && n >= 0 ? n : 0;
  }, [values.basePrice]);

  const rowsByKey = React.useMemo(() => {
    const map = new Map<string, VariantRow>();
    for (const v of values.variants) {
      map.set(attributesKey(v.attributes), v);
    }
    return map;
  }, [values.variants]);

  const rows = React.useMemo<VariantRow[]>(() => {
    const generated = cartesianAttributes(values.variantDimensions);
    return generated.map((attributes) => {
      const key = attributesKey(attributes);
      const existing = rowsByKey.get(key);
      return (
        existing ?? {
          attributes,
          stock: 0,
          priceOverride: null,
          isActive: true,
        }
      );
    });
  }, [values.variantDimensions, rowsByKey]);

  function setDimensions(next: VariantDimension[]) {
    const generated = cartesianAttributes(next);
    const newVariants = generated.map((attributes) => {
      const key = attributesKey(attributes);
      const existing = rowsByKey.get(key);
      return (
        existing ?? {
          attributes,
          stock: 0,
          priceOverride: null,
          isActive: true,
        }
      );
    });
    onChange({
      ...values,
      variantDimensions: next,
      variants: newVariants,
    });
  }

  function setRows(next: VariantRow[]) {
    onChange({ ...values, variants: next });
  }

  return (
    <div className="space-y-6">
      <section className="space-y-3">
        <h2 className="text-foreground text-sm font-semibold">
          {vocab.optionGroups}
        </h2>
        <DimensionEditor
          dimensions={values.variantDimensions}
          onChange={setDimensions}
        />
      </section>

      <section className="space-y-3">
        <h2 className="text-foreground text-sm font-semibold">
          {vocab.variantsHeading}
        </h2>
        <VariantGrid
          rows={rows}
          basePrice={basePriceNumber}
          onChange={setRows}
        />
      </section>
    </div>
  );
}
