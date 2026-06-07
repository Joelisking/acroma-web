import type { ParsedProduct, ProductFormValues } from "@/lib/api/types";

export const EMPTY_FORM_VALUES: ProductFormValues = {
  name: "",
  description: "",
  basePrice: "",
  stock: "",
  estimatedDurationMinutes: "",
  category: "",
  imageUrl: "",
  isActive: true,
  hasVariants: false,
  variantDimensions: [],
  variants: [],
  tags: [],
};

/**
 * Merges a freshly parsed product into the existing form values, preserving
 * `imageUrl` and `isActive` so AI re-parses never clobber an uploaded photo
 * or a deliberate visibility toggle.
 */
export function parsedToFormValues(
  p: ParsedProduct,
  prev: ProductFormValues,
): ProductFormValues {
  return {
    name: p.name,
    description: p.description ?? "",
    basePrice: String(p.basePrice),
    stock: String(p.stock ?? 0),
    estimatedDurationMinutes:
      p.estimatedDurationMinutes != null
        ? String(p.estimatedDurationMinutes)
        : prev.estimatedDurationMinutes,
    category: p.category ?? "",
    imageUrl: prev.imageUrl,
    isActive: prev.isActive,
    hasVariants: p.hasVariants,
    variantDimensions: p.variantDimensions,
    variants: p.variants.map((v) => ({
      attributes: v.attributes,
      stock: v.stock,
      priceOverride: v.priceOverride,
      isActive: true,
    })),
    // AI parsing doesn't (yet) infer dietary tags. Preserve whatever the
    // merchant already selected manually so a re-parse never clobbers
    // tags they've picked.
    tags: prev.tags,
  };
}
