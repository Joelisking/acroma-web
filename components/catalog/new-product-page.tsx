"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Loader2, ImagePlus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { ImageUploader } from "@/components/shared/image-uploader";
import { NewProductTabs } from "@/components/catalog/new-product-tabs";
import { DescribeWithAiPanel } from "@/components/catalog/describe-with-ai-panel";
import { ManualProductForm } from "@/components/catalog/manual-product-form";
import { VariantOptionImages } from "@/components/catalog/variant-option-images";
import { useNewProduct } from "@/hooks/use-new-product";
import { InlineVariantsEditor } from "@/components/catalog/variants/inline-variants-editor";
import { useVocab } from "@/components/vocabulary-provider";
import type { BusinessType } from "@/lib/api/types";

type Props = {
  businessType?: BusinessType | null;
  categories?: string[];
};

export function NewProductPageClient({
  businessType,
  categories = [],
}: Props = {}) {
  const router = useRouter();
  const np = useNewProduct();
  const vocab = useVocab();
  const isFood = businessType === "FOOD_BEVERAGES";

  const showVariantImages =
    np.formValues.hasVariants && np.formValues.variantDimensions.length > 0;

  return (
    <div className="space-y-6">
      <NewProductTabs mode={np.mode} onModeChange={np.setMode} />

      {/* Photo first, as a friendly banner instead of a buried field. */}
      <div className="space-y-1.5">
        <ImageUploader
          kind="product"
          aspect="aspect-[16/9]"
          value={np.formValues.imageUrl || null}
          onChange={(url) =>
            np.setFormValues({ ...np.formValues, imageUrl: url ?? "" })
          }
        />
        <p className="text-muted-foreground flex items-center gap-1.5 text-xs">
          <ImagePlus className="size-3.5" />
          {isFood
            ? "Add a photo of the dish. Acroma can send it to customers in chat."
            : "Add a photo. Acroma can send it to customers in chat."}
        </p>
      </div>

      {np.mode === "describe" ? (
        <DescribeWithAiPanel
          parsedPreview={np.parsedPreview}
          originalDescription={np.originalDescription}
          parsing={np.parsing}
          refining={np.refining}
          onParse={np.parse}
          onRefine={np.refine}
          onEditOriginal={np.editOriginal}
        />
      ) : (
        <ManualProductForm
          values={np.formValues}
          onChange={np.setFormValues}
          businessType={businessType}
          categories={categories}
        />
      )}

      {np.formValues.hasVariants ? (
        <InlineVariantsEditor
          values={np.formValues}
          onChange={np.setFormValues}
        />
      ) : null}

      {showVariantImages ? (
        <VariantOptionImages
          dimensions={np.formValues.variantDimensions}
          onChange={(dims) =>
            np.setFormValues({ ...np.formValues, variantDimensions: dims })
          }
        />
      ) : null}

      <div className="border-border/70 bg-muted/30 flex items-center justify-between gap-4 rounded-xl border p-4">
        <div>
          <Label htmlFor="add-another" className="cursor-pointer">
            Add another after saving
          </Label>
          <p className="text-muted-foreground text-xs">
            Stay here with a fresh form instead of going back to {vocab.catalog}.
          </p>
        </div>
        <Switch
          id="add-another"
          checked={np.addAnother}
          onCheckedChange={np.setAddAnother}
        />
      </div>

      {/* Non-sticky on purpose: a fixed mobile bottom nav already sits at the
          bottom of the dashboard shell. */}
      <div className="flex gap-3 pt-2">
        <Button
          type="button"
          variant="ghost"
          onClick={() => router.back()}
          disabled={np.saving}
          className="rounded-xl"
        >
          Cancel
        </Button>
        <Button
          type="button"
          onClick={() => np.commit(vocab.item)}
          disabled={!np.canSave || np.saving}
          className="bg-brand-orange hover:bg-brand-orange/90 h-11 flex-1 gap-2 rounded-xl px-5"
        >
          {np.saving ? <Loader2 className="animate-spin" /> : null}
          {isFood ? "Add to menu" : `Add ${vocab.itemLower}`}
        </Button>
      </div>
    </div>
  );
}
