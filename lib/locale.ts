/**
 * Currencies + countries surfaced in the business profile form.
 * Acroma is West-Africa-first; expand the list as we open new markets.
 */

export const CURRENCIES = [
  { value: "GHS", label: "Ghanaian Cedi (GHS)" },
  { value: "NGN", label: "Nigerian Naira (NGN)" },
  { value: "XOF", label: "West African CFA franc (XOF)" },
  { value: "USD", label: "US Dollar (USD)" },
] as const;

export const COUNTRIES = [
  { value: "GH", label: "Ghana" },
  { value: "NG", label: "Nigeria" },
  { value: "CI", label: "Côte d'Ivoire" },
  { value: "SN", label: "Senegal" },
] as const;
