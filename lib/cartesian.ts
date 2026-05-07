import type { VariantDimension } from "@/lib/api/types";

/**
 * Cartesian product of dimension options.
 *   [{ name: "Color", options: ["Black","White"] },
 *    { name: "Size",  options: ["S","M"] }]
 *  → [
 *      { Color: "Black", Size: "S" },
 *      { Color: "Black", Size: "M" },
 *      { Color: "White", Size: "S" },
 *      { Color: "White", Size: "M" },
 *    ]
 *
 * Returns [] if any dimension has no options or there are no dimensions.
 */
export function cartesianAttributes(
  dimensions: VariantDimension[],
): Array<Record<string, string>> {
  if (dimensions.length === 0) return [];
  const valid = dimensions.filter((d) => d.options.length > 0);
  if (valid.length !== dimensions.length) return [];

  return valid.reduce<Array<Record<string, string>>>(
    (acc, dim) =>
      acc.flatMap((row) =>
        dim.options.map((opt) => ({ ...row, [dim.name]: opt })),
      ),
    [{}],
  );
}

export function attributesKey(attrs: Record<string, string>): string {
  return Object.entries(attrs)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([k, v]) => `${k}=${v}`)
    .join("|");
}
