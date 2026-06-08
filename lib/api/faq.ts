import "server-only";

import { apiFetch } from "./server";

export type FaqCategory =
  | "DELIVERY"
  | "PAYMENT"
  | "HOURS"
  | "LOCATION"
  | "RETURNS"
  | "WHOLESALE"
  | "OTHER";

export type FaqEntry = {
  id: string;
  businessId: string;
  category: FaqCategory;
  question: string;
  answer: string;
  order: number;
  active: boolean;
  isTemplate: boolean;
  createdAt: string;
  updatedAt: string;
};

export async function listFaqEntries(): Promise<FaqEntry[]> {
  return apiFetch<FaqEntry[]>("/faq");
}

export async function getOnboardingFaqs(): Promise<FaqEntry[]> {
  return apiFetch<FaqEntry[]>("/faq/onboarding");
}
