import type { Metadata } from "next";
import { getCurrentBusiness } from "@/lib/api/business";
import { WizardShell } from "@/components/onboarding/wizard-shell";
import { FaqSeedStep } from "@/components/onboarding/faq-seed-step";
import { FaqReviewStep } from "@/components/onboarding/faq-review-step";
import { getFaqSeeds } from "@/lib/onboarding/faq-seeds";
import { getOnboardingFaqs } from "@/lib/api/faq";

export const metadata: Metadata = {
  title: "FAQs · Acroma",
};

export default async function Step6Page() {
  const business = await getCurrentBusiness();

  // Food: edit the FAQ rows already seeded into the knowledge base, so there
  // is one source of truth and no duplicate entries. Other verticals keep the
  // legacy seed-and-create flow until they are reviewed.
  const isFood = business?.businessType === "FOOD_BEVERAGES";
  const entries = isFood ? await getOnboardingFaqs() : [];
  const seeds = isFood ? [] : getFaqSeeds(business?.businessType);

  return (
    <WizardShell
      step={6}
      eyebrow="Knowledge base"
      title="Answer the questions customers always ask."
      subtitle="Acroma uses these to reply instantly, without escalating to you."
    >
      {isFood ? (
        <FaqReviewStep entries={entries} />
      ) : (
        <FaqSeedStep seeds={seeds} />
      )}
    </WizardShell>
  );
}
