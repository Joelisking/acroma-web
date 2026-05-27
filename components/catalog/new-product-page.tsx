"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
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
};

export function NewProductPageClient({ businessType }: Props = {}) {
  const router = useRouter();
  const np = useNewProduct();
  const vocab = useVocab();

  const showVariantImages =
    np.formValues.hasVariants && np.formValues.variantDimensions.length > 0;

  return (
    <div className="space-y-6">
      <NewProductTabs mode={np.mode} onModeChange={np.setMode} />

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
        />
      )}

      {np.formValues.hasVariants ? (
        <InlineVariantsEditor
          values={np.formValues}
          onChange={np.setFormValues}
        />
      ) : null}

      <div className="space-y-2">
        <Label>{vocab.item} image</Label>
        <ImageUploader
          kind="product"
          aspect="aspect-[4/3]"
          value={np.formValues.imageUrl || null}
          onChange={(url) =>
            np.setFormValues({ ...np.formValues, imageUrl: url ?? "" })
          }
        />
      </div>

      {showVariantImages ? (
        <VariantOptionImages
          dimensions={np.formValues.variantDimensions}
          onChange={(dims) =>
            np.setFormValues({ ...np.formValues, variantDimensions: dims })
          }
        />
      ) : null}

      <div className="flex justify-end gap-3 pt-2">
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
          onClick={np.commit}
          disabled={!np.canSave || np.saving}
          className="bg-brand-orange hover:bg-brand-orange/90 h-10 gap-2 rounded-xl px-5"
        >
          {np.saving ? <Loader2 className="animate-spin" /> : null}
          Add {vocab.itemLower}
        </Button>
      </div>
    </div>
  );
}
