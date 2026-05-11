import type { Metadata } from "next";
import { getCurrentBusiness } from "@/lib/api/business";
import { SettingsCard } from "@/components/settings/settings-card";
import { OpeningHoursForm } from "@/components/settings/opening-hours-form";

export const metadata: Metadata = {
  title: "Hours · Settings · Acroma",
};

export default async function OpeningHoursSettingsPage() {
  const business = await getCurrentBusiness();
  if (!business) return null;

  return (
    <div className="space-y-6">
      <SettingsCard
        title="Opening hours"
        description="When you're closed, Acroma replies to escalation requests with 'We're closed, back at X' instead of pinging you. Orders and other conversations still flow normally."
      >
        <OpeningHoursForm initial={business.openingHours} />
      </SettingsCard>
    </div>
  );
}
