import type { BusinessType } from "@/lib/api/types";

/**
 * Per-merchant vocabulary swap for user-facing copy. Internal naming
 * (Prisma fields, routes, components, variables) stays neutral —
 * "product", "catalog", etc. — per the repo CLAUDE.md ground rule. Only
 * surfaces the merchant reads (labels, headings, empty states, CTAs)
 * swap on this.
 *
 * Keep this file focused and small. Adding a key here is cheap; renaming
 * one across the codebase later is not. Only add a key when a UI surface
 * actually needs to swap copy. Do not pre-emptively add keys "for
 * completeness".
 */
export type Vocabulary = {
  /** "Catalog" | "Menu" — used for the nav label and page headings. */
  catalog: string;
  /** "Product" | "Menu item" — singular, title case. */
  item: string;
  /** "Products" | "Menu items" — plural, title case. */
  items: string;
  /** "product" | "menu item" — singular, lower case (mid-sentence). */
  itemLower: string;
  /** "products" | "menu items" — plural, lower case (mid-sentence). */
  itemsLower: string;
  /** "Shipped" | "Out for delivery" — display label for the SHIPPED status. */
  shippedLabel: string;
  /** "Mark as shipped" | "Mark out for delivery" — action verb for the SHIPPED transition. */
  markShippedLabel: string;
  /** "Dimension" | "Option group" — a single variant axis (e.g. Size). Title case. */
  optionGroup: string;
  /** "Dimensions" | "Option groups" — plural, used as a section heading. Title case. */
  optionGroups: string;
  /** Placeholder example for naming a variant axis (e.g. "e.g. Color, Size"). */
  optionGroupExample: string;
  /** "Variants" | "Combinations" — heading for the generated per-option rows. */
  variantsHeading: string;
  /** "Variant" | "Combination" — singular label/column for one generated row. */
  variantLabel: string;
  /**
   * Whether this vertical tracks numeric stock counts. Food merchants don't
   * (they use the "sold out today" model), so stock inputs are hidden for
   * them. This is the one behavioral flag here; every other field is copy.
   */
  tracksStock: boolean;
};

const FOOD: Vocabulary = {
  catalog: "Menu",
  item: "Menu item",
  items: "Menu items",
  itemLower: "menu item",
  itemsLower: "menu items",
  shippedLabel: "Out for delivery",
  markShippedLabel: "Mark out for delivery",
  optionGroup: "Option group",
  optionGroups: "Option groups",
  optionGroupExample: "e.g. Size, Spice level",
  variantsHeading: "Combinations",
  variantLabel: "Combination",
  tracksStock: false,
};

const GENERAL: Vocabulary = {
  catalog: "Catalog",
  item: "Product",
  items: "Products",
  itemLower: "product",
  itemsLower: "products",
  shippedLabel: "Shipped",
  markShippedLabel: "Mark as shipped",
  optionGroup: "Dimension",
  optionGroups: "Dimensions",
  optionGroupExample: "e.g. Color, Size",
  variantsHeading: "Variants",
  variantLabel: "Variant",
  tracksStock: true,
};

/**
 * Resolve the vocabulary for a merchant. Defaults to the generic copy —
 * if `businessType` is null/undefined (older account, missing field, etc.),
 * the generic vocabulary wins.
 */
export function getVocabulary(
  businessType: BusinessType | null | undefined,
): Vocabulary {
  if (businessType === "FOOD_BEVERAGES") return FOOD;
  return GENERAL;
}
