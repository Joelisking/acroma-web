import * as React from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import {
  parseProductAction,
} from "@/lib/api/products-ai-actions";
import { createProductAction } from "@/lib/api/products-actions";
import { saveVariantsAction } from "@/lib/api/variants-actions";
import type { ParsedProduct, ProductFormValues } from "@/lib/api/types";
import { EMPTY_FORM_VALUES, parsedToFormValues } from "@/lib/catalog/product-form-utils";

export type NewProductMode = "describe" | "manual";

export function useNewProduct() {
  const router = useRouter();

  const [mode, setMode] = React.useState<NewProductMode>("manual");
  const [formValues, setFormValues] = React.useState<ProductFormValues>(EMPTY_FORM_VALUES);
  const [parsedPreview, setParsedPreview] = React.useState<ParsedProduct | null>(null);
  const [originalDescription, setOriginalDescription] = React.useState("");

  const [parsing, startParse] = React.useTransition();
  const [refining, startRefine] = React.useTransition();
  const [saving, startSave] = React.useTransition();

  function parse(description: string) {
    if (!description) return;
    startParse(async () => {
      const result = await parseProductAction({ description });
      if (!result.ok) {
        toast.error(result.error);
        return;
      }
      setParsedPreview(result.data);
      setOriginalDescription(description);
      setFormValues((prev) => parsedToFormValues(result.data, prev));
    });
  }

  function refine(followUp: string) {
    if (!followUp || !parsedPreview) return;
    startRefine(async () => {
      const result = await parseProductAction({
        description: originalDescription,
        followUp,
        current: parsedPreview as unknown as Record<string, unknown>,
      });
      if (!result.ok) {
        toast.error(result.error);
        return;
      }
      setParsedPreview(result.data);
      setFormValues((prev) => parsedToFormValues(result.data, prev));
    });
  }

  /** Returns to the pre-parse state so the merchant can re-edit the prompt. */
  function editOriginal() {
    setParsedPreview(null);
  }

  /**
   * Form is valid for save when there's a name and a non-negative numeric price.
   * (Variants can be empty — the product page lets the merchant add them later.)
   */
  const canSave = React.useMemo(() => {
    if (formValues.name.trim() === "") return false;
    const price = Number(formValues.basePrice);
    if (!Number.isFinite(price) || price < 0) return false;
    return true;
  }, [formValues.name, formValues.basePrice]);

  function commit() {
    if (!canSave) return;
    startSave(async () => {
      const create = await createProductAction({
        name: formValues.name.trim(),
        description: formValues.description.trim() || undefined,
        basePrice: Number(formValues.basePrice),
        stock: formValues.hasVariants
          ? 0
          : Number.isFinite(Number(formValues.stock))
            ? Number(formValues.stock)
            : 0,
        category: formValues.category.trim() || undefined,
        imageUrl: formValues.imageUrl.trim() || undefined,
        isActive: formValues.isActive,
        tags: formValues.tags,
      });
      if (!create.ok) {
        toast.error(create.error);
        return;
      }

      if (formValues.hasVariants && formValues.variantDimensions.length > 0) {
        const variantsResult = await saveVariantsAction(create.data.id, {
          dimensions: formValues.variantDimensions,
          variants: formValues.variants.map((v) => ({
            attributes: v.attributes,
            stock: v.stock,
            priceOverride: v.priceOverride,
            isActive: v.isActive,
          })),
        });
        if (!variantsResult.ok) {
          toast.error(variantsResult.error);
          return;
        }
      }

      toast.success("Product added");
      router.replace(`/dashboard/catalog/${create.data.id}`);
      router.refresh();
    });
  }

  return {
    mode,
    setMode,
    formValues,
    setFormValues,
    parsedPreview,
    originalDescription,
    parsing,
    refining,
    saving,
    canSave,
    parse,
    refine,
    editOriginal,
    commit,
  };
}
