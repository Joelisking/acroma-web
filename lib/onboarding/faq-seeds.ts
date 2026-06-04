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

const FOOD_SEEDS: FaqSeed[] = [
  {
    category: "DELIVERY",
    question: "Do you deliver? Which areas do you cover, and what are the delivery fees?",
  },
  {
    category: "DELIVERY",
    question: "How long does an order take?",
  },
  {
    category: "PAYMENT",
    question: "What payment methods do you accept? Do you take MoMo?",
  },
  {
    category: "OTHER",
    question: "Can I pre-order food or order in advance?",
  },
  {
    category: "OTHER",
    question: "Do you have vegetarian or other dietary options?",
  },
  {
    category: "OTHER",
    question: "Can I customize my order? (e.g. less spicy, no salad, extra meat, more shito)",
  },
];

const SEEDS_BY_TYPE: Partial<Record<BusinessType, FaqSeed[]>> = {
  FOOD_BEVERAGES: FOOD_SEEDS,
};

export function getFaqSeeds(
  businessType: BusinessType | null | undefined,
): FaqSeed[] {
  if (!businessType) return GENERIC_SEEDS;
  return SEEDS_BY_TYPE[businessType] ?? GENERIC_SEEDS;
}
