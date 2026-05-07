import type { Metadata } from "next";
import { WizardShell } from "@/components/onboarding/wizard-shell";
import { FinishStep } from "@/components/onboarding/finish-step";

export const metadata: Metadata = { title: "All set · Acroma" };

export default function Step4Page() {
  return (
    <WizardShell
      step={4}
      eyebrow="Almost there"
      title="One last thing."
      subtitle="Let's open your live dashboard so you can watch Acroma work."
    >
      <FinishStep />
    </WizardShell>
  );
}
