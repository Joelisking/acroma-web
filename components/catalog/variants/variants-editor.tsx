"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Save, Loader2 } from "lucide-react";
import { toast } from "sonner";

import type { Product, VariantDimension } from "@/lib/api/types";
import { Button } from "@/components/ui/button";
import { saveVariantsAction } from "@/lib/api/variants-actions";
import { cartesianAttributes, attributesKey } from "@/lib/cartesian";
import { DimensionEditor } from "./dimension-editor";
import { VariantGrid } from "./variant-grid";
import type { VariantRow } from "./variant-row-input";
import { SuggestButton } from "./suggest-button";
import { useVocab } from "@/components/vocabulary-provider";

type VariantsEditorProps = {
  product: Product;
};

export function VariantsEditor({ product }: VariantsEditorProps) {
  const router = useRouter();
  const vocab = useVocab();
  const [pending, startTransition] = React.useTransition();

  const [dimensions, setDimensions] = React.useState<VariantDimension[]>(
    product.variantDimensions ?? [],
  );

  // Map of attributes-key → existing variant data (preserves user edits + ids).
  const initialRows = React.useMemo(() => {
    const map = new Map<string, VariantRow>();
    for (const v of product.variants ?? []) {
      map.set(attributesKey(v.attributes), {
        attributes: v.attributes,
        stock: v.stock,
        priceOverride: v.priceOverride,
        isActive: v.isActive,
      });
    }
    return map;
  }, [product.variants]);

  const [rowsByKey, setRowsByKey] = React.useState<Map<string, VariantRow>>(
    initialRows,
  );

  // Generated rows from dimensions × options, merged with any existing edits.
  const rows = React.useMemo<VariantRow[]>(() => {
    const generated = cartesianAttributes(dimensions);
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
  }, [dimensions, rowsByKey]);

  function updateRows(next: VariantRow[]) {
    setRowsByKey((prev) => {
      const map = new Map(prev);
      for (const r of next) {
        map.set(attributesKey(r.attributes), r);
      }
      return map;
    });
  }

  function onSave() {
    if (dimensions.some((d) => !d.name.trim() || d.options.length === 0)) {
      toast.error(
        `Every ${vocab.optionGroup.toLowerCase()} needs a name and at least one option`,
      );
      return;
    }

    startTransition(async () => {
      const result = await saveVariantsAction(product.id, {
        dimensions,
        variants: rows,
      });
      if (!result.ok) {
        toast.error(result.error);
        return;
      }
      toast.success("Variants saved");
      router.replace(`/dashboard/catalog/${product.id}`);
      router.refresh();
    });
  }

  return (
    <div className="space-y-8">
      <section className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-foreground text-sm font-semibold">
            {vocab.optionGroups}
          </h2>
          <SuggestButton
            productId={product.id}
            productName={product.name}
            onSuggestions={(suggested) => {
              setDimensions(suggested);
              setRowsByKey(new Map());
            }}
          />
        </div>
        <DimensionEditor dimensions={dimensions} onChange={setDimensions} />
      </section>

      <section className="space-y-4">
        <h2 className="text-foreground text-sm font-semibold">
          {vocab.variantsHeading}
        </h2>
        <VariantGrid
          rows={rows}
          basePrice={product.basePrice}
          onChange={updateRows}
        />
      </section>

      <div className="flex justify-end gap-3">
        <Button
          type="button"
          variant="ghost"
          onClick={() => router.back()}
          disabled={pending}
          className="rounded-xl"
        >
          Cancel
        </Button>
        <Button
          onClick={onSave}
          disabled={pending}
          className="bg-brand-orange hover:bg-brand-orange/90 h-10 gap-2 rounded-xl px-5"
        >
          {pending ? <Loader2 className="animate-spin" /> : <Save />}
          Save variants
        </Button>
      </div>
    </div>
  );
}
