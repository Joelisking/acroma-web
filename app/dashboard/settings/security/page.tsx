import type { Metadata } from "next";
import { SettingsCard } from "@/components/settings/settings-card";
import { ChangePasswordForm } from "@/components/settings/change-password-form";
import { SignOutCard } from "@/components/settings/sign-out-card";
import { redirectStaffToOrders } from "@/lib/api/owner-only";

export const metadata: Metadata = { title: "Security · Settings · Acroma" };

export default async function SecuritySettingsPage() {
  await redirectStaffToOrders();

  return (
    <div className="space-y-6">
      <SettingsCard
        title="Change password"
        description="Set a new password for your Acroma account. After saving, you'll stay signed in here while every other device is signed out."
      >
        <ChangePasswordForm />
      </SettingsCard>

      <SignOutCard />
    </div>
  );
}
