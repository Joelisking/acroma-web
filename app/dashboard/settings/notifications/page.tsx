import type { Metadata } from "next";
import { getVapidPublicKey } from "@/lib/api/web-push";
import { SettingsCard } from "@/components/settings/settings-card";
import { NotificationsCard } from "@/components/settings/notifications-card";

export const metadata: Metadata = { title: "Notifications · Settings · Acroma" };

export default async function NotificationsSettingsPage() {
  const vapidPublicKey = await getVapidPublicKey();

  return (
    <div className="space-y-6">
      <SettingsCard
        title="Browser notifications"
        description="Get pinged in this browser the moment a new order or escalation comes in — even when Acroma isn't open."
      >
        <NotificationsCard vapidPublicKey={vapidPublicKey} />
      </SettingsCard>
    </div>
  );
}
