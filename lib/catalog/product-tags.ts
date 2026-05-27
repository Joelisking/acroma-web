import type { ProductTag } from "@/lib/api/types";

/**
 * Display labels + canonical order for dietary / allergen tags. Mirrors
 * the backend `ProductTag` enum from `prisma/schema.prisma`. Single source
 * of truth shared by the picker (client) and the card / detail page
 * (server) so server components don't need to pull in the picker module.
 */
export const TAG_OPTIONS: ReadonlyArray<{ value: ProductTag; label: string }> =
  [
    { value: "HALAL", label: "Halal" },
    { value: "VEGETARIAN", label: "Vegetarian" },
    { value: "VEGAN", label: "Vegan" },
    { value: "GLUTEN_FREE", label: "Gluten-free" },
    { value: "DAIRY_FREE", label: "Dairy-free" },
    { value: "CONTAINS_NUTS", label: "Contains nuts" },
    { value: "SPICY", label: "Spicy" },
  ];

export function tagLabel(tag: ProductTag): string {
  return TAG_OPTIONS.find((o) => o.value === tag)?.label ?? tag;
}
