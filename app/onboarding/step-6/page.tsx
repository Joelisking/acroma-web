import type { Metadata } from "next";
import { WizardShell } from "@/components/onboarding/wizard-shell";
import { FaqReviewStep } from "@/components/onboarding/faq-review-step";
import { getOnboardingFaqs } from "@/lib/api/faq";

export const metadata: Metadata = {
  title: "FAQs · Acroma",
};

export default async function Step6Page() {
  // The knowledge base is seeded at registration (generic pack) and when the
  // merchant picks their vertical (food / services pack). Onboarding edits and
  // activates the rows already seeded for this merchant's vertical, so there
  // is one source of truth and no duplicate FAQs. The backend decides which
  // questions apply to the vertical.
  const entries = await getOnboardingFaqs();

  return (
    <WizardShell
      step={6}
      eyebrow="Knowledge base"
      title="Answer the questions customers always ask."
      subtitle="Acroma uses these to reply instantly, without escalating to you."
    >
      <FaqReviewStep entries={entries} />
    </WizardShell>
  );
}
