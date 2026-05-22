import type { Metadata } from "next";
import { getCurrentBusiness } from "@/lib/api/business";
import { SettingsCard } from "@/components/settings/settings-card";
import { EmailNotificationsCard } from "@/components/settings/email-notifications-card";
import { PushNotificationsCard } from "@/components/settings/push-notifications-card";

export const metadata: Metadata = {
  title: "Notifications · Settings · Acroma",
};

export default async function NotificationsSettingsPage() {
  const business = await getCurrentBusiness();
  if (!business) return null;

  return (
    <div className="space-y-6">
      <SettingsCard
        title="Device notifications"
        description="Get alerts on this device, and install Acroma to your home screen, for orders, payments, and escalations."
      >
        <PushNotificationsCard />
      </SettingsCard>

      <SettingsCard
        title="Email notifications"
        description="Stay in the loop on orders, payments, and customer escalations over email."
      >
        <EmailNotificationsCard business={business} />
      </SettingsCard>
    </div>
  );
}
