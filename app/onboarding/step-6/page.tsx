import type { Metadata } from "next";
import { getCurrentBusiness } from "@/lib/api/business";
import { WizardShell } from "@/components/onboarding/wizard-shell";
import { FaqSeedStep } from "@/components/onboarding/faq-seed-step";
import { getFaqSeeds } from "@/lib/onboarding/faq-seeds";

export const metadata: Metadata = {
  title: "FAQs · Acroma",
};

export default async function Step6Page() {
  const business = await getCurrentBusiness();
  const seeds = getFaqSeeds(business?.businessType);

  return (
    <WizardShell
      step={6}
      eyebrow="Knowledge base"
      title="Answer the questions customers always ask."
      subtitle="Acroma uses these to reply instantly, without escalating to you."
    >
      <FaqSeedStep seeds={seeds} />
    </WizardShell>
  );
}
