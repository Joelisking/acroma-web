import type { Product } from "@/lib/api/types";

/**
 * Distinct, non-empty product categories for a merchant, de-duped
 * case-insensitively (first-seen casing wins) and sorted alphabetically.
 * Used to populate the category combobox on the add/edit item forms.
 */
export function distinctCategories(products: Product[]): string[] {
  const seen = new Map<string, string>();
  for (const product of products) {
    const category = product.category?.trim();
    if (!category) continue;
    const key = category.toLowerCase();
    if (!seen.has(key)) seen.set(key, category);
  }
  return Array.from(seen.values()).sort((a, b) =>
    a.localeCompare(b, undefined, { sensitivity: "base" }),
  );
}

export type CategoryGroup = {
  /** Display label (first-seen casing), or null for uncategorized items. */
  category: string | null;
  items: Product[];
};

/**
 * Group products into category sections for the menu view. Categories appear
 * in first-seen order (case-insensitively de-duped); uncategorized items fall
 * into a trailing null-category group. Preserves each category's item order.
 */
export function groupByCategory(products: Product[]): CategoryGroup[] {
  const order: string[] = [];
  const labels = new Map<string, string>();
  const byKey = new Map<string, Product[]>();
  const uncategorized: Product[] = [];

  for (const product of products) {
    const category = product.category?.trim();
    if (!category) {
      uncategorized.push(product);
      continue;
    }
    const key = category.toLowerCase();
    if (!byKey.has(key)) {
      byKey.set(key, []);
      labels.set(key, category);
      order.push(key);
    }
    byKey.get(key)!.push(product);
  }

  const groups: CategoryGroup[] = order.map((key) => ({
    category: labels.get(key)!,
    items: byKey.get(key)!,
  }));
  if (uncategorized.length > 0) {
    groups.push({ category: null, items: uncategorized });
  }
  return groups;
}
