import type { Metadata } from "next";
import { SettingsCard } from "@/components/settings/settings-card";
import { ChangePasswordForm } from "@/components/settings/change-password-form";

export const metadata: Metadata = { title: "Security · Settings · Acroma" };

export default function SecuritySettingsPage() {
  return (
    <div className="space-y-6">
      <SettingsCard
        title="Change password"
        description="Set a new password for your Acroma account. After saving, you'll stay signed in here while every other device is signed out."
      >
        <ChangePasswordForm />
      </SettingsCard>
    </div>
  );
}
