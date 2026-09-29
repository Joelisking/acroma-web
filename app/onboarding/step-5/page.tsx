import type { Metadata } from "next"
import { getCurrentBusiness } from "@/lib/api/business"
import { estateSettings } from "@/lib/api/real-estate"
import { WizardShell } from "@/components/onboarding/wizard-shell"
import { OnboardingOpeningHoursStep } from "@/components/onboarding/opening-hours-step"
import { EstateAppointmentsStep } from "@/components/onboarding/estate-appointments-step"

export const metadata: Metadata = {
  title: "Opening hours · Acroma",
}

export default async function Step5Page() {
  const business = await getCurrentBusiness()

  if (business?.businessType === "REAL_ESTATE") {
    const settings = await estateSettings()
    return (
      <WizardShell
        step={5}
        eyebrow="Appointments"
        title="When can buyers book with you?"
        subtitle="Acroma books viewings and consultations for you on WhatsApp. You can change these later in Appointment settings."
      >
        <EstateAppointmentsStep
          settings={settings}
          hours={business.openingHours ?? null}
        />
      </WizardShell>
    )
  }

  return (
    <WizardShell
      step={5}
      eyebrow="Hours"
      title="When are you open?"
      subtitle="Acroma replies 'We're closed' during off-hours instead of pinging you."
    >
      <OnboardingOpeningHoursStep initial={business?.openingHours ?? null} />
    </WizardShell>
  )
}
