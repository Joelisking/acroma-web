import type { Metadata } from "next";

import { getReminderSettings } from "@/lib/api/settings";
import { getCurrentBusiness } from "@/lib/api/business";
import { SettingsCard } from "@/components/settings/settings-card";
import { ReminderSettingsForm } from "@/components/settings/reminder-settings-form";
import { AppointmentReminderSettingsForm } from "@/components/settings/appointment-reminder-settings-form";
import { redirectStaffToOrders } from "@/lib/api/owner-only";

export const metadata: Metadata = {
  title: "Reminders · Settings · Acroma",
};

export default async function RemindersSettingsPage() {
  await redirectStaffToOrders();

  const [settings, business] = await Promise.all([
    getReminderSettings(),
    getCurrentBusiness(),
  ]);

  return (
    <div className="space-y-6">
      <SettingsCard
        title="Escalation reminders"
        description="When Acroma escalates a chat to you, this is how it follows up if you don't reply. After the auto-takeover threshold, Acroma steps back in to hold the line while the conversation stays flagged for you."
      >
        <ReminderSettingsForm initial={settings} />
      </SettingsCard>

      {business?.businessType === "SERVICES" ? (
        <SettingsCard
          title="Appointment reminders"
          description="Remind customers before their booking. Customers active in the last 24 hours get a normal message; reaching others needs an approved WhatsApp template."
        >
          <AppointmentReminderSettingsForm initial={settings} />
        </SettingsCard>
      ) : null}
    </div>
  );
}
