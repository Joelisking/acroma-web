import type { FaqCategory } from "@/lib/api/faq";
import type { BusinessType } from "@/lib/api/types";

export type FaqSeed = {
  category: FaqCategory;
  question: string;
};

const GENERIC_SEEDS: FaqSeed[] = [
  {
    category: "DELIVERY",
    question: "Do you offer delivery? What areas do you cover?",
  },
  {
    category: "PAYMENT",
    question: "What payment methods do you accept?",
  },
  {
    category: "HOURS",
    question: "What are your opening hours?",
  },
  {
    category: "LOCATION",
    question: "Where are you located?",
  },
];

// Food FAQ questions — to be filled in when the merchant provides them.
const FOOD_SEEDS: FaqSeed[] = [];

const SEEDS_BY_TYPE: Partial<Record<BusinessType, FaqSeed[]>> = {
  FOOD_BEVERAGES: FOOD_SEEDS,
};

export function getFaqSeeds(
  businessType: BusinessType | null | undefined,
): FaqSeed[] {
  if (!businessType) return GENERIC_SEEDS;
  return SEEDS_BY_TYPE[businessType] ?? GENERIC_SEEDS;
}
