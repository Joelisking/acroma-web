import type { Metadata } from "next";

import { getReminderSettings } from "@/lib/api/settings";
import { SettingsCard } from "@/components/settings/settings-card";
import { ReminderSettingsForm } from "@/components/settings/reminder-settings-form";

export const metadata: Metadata = {
  title: "Reminders · Settings · Acroma",
};

export default async function RemindersSettingsPage() {
  const settings = await getReminderSettings();

  return (
    <div className="space-y-6">
      <SettingsCard
        title="Escalation reminders"
        description="When Acroma escalates a chat to you, this is how it follows up if you don't reply. After the auto-takeover threshold, Acroma steps back in to hold the line while the conversation stays flagged for you."
      >
        <ReminderSettingsForm initial={settings} />
      </SettingsCard>
    </div>
  );
}
