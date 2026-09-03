import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, BookOpen } from "lucide-react";

import { getWhatsappSettings } from "@/lib/api/settings";
import { SettingsCard } from "@/components/settings/settings-card";
import { WhatsappStatus } from "@/components/settings/whatsapp-status";
import { WhatsappForm } from "@/components/settings/whatsapp-form";
import { WhatsappTestButton } from "@/components/settings/whatsapp-test-button";
import { CopyField } from "@/components/settings/copy-field";
import { redirectStaffHome } from "@/lib/api/owner-only";

export const metadata: Metadata = { title: "WhatsApp · Settings · Acroma" };

export default async function WhatsappSettingsPage() {
  await redirectStaffHome();

  const settings = await getWhatsappSettings();

  return (
    <div className="space-y-6">
      <Link
        href="/dashboard/settings/whatsapp/guide"
        className="border-border/70 bg-card hover:border-brand-orange/40 group flex items-center gap-3 rounded-2xl border p-4 transition-colors"
      >
        <span className="bg-brand-orange/15 text-brand-orange flex size-9 shrink-0 items-center justify-center rounded-xl">
          <BookOpen className="size-4.5" aria-hidden />
        </span>
        <div className="min-w-0 flex-1 space-y-0.5">
          <p className="text-foreground text-sm font-medium">
            New to WhatsApp Cloud API? Read the setup guide.
          </p>
          <p className="text-muted-foreground text-xs leading-relaxed">
            Step-by-step: where to find your phone number ID, business account
            ID, and how to generate a permanent access token.
          </p>
        </div>
        <span className="text-brand-orange inline-flex shrink-0 items-center gap-1 text-sm font-medium">
          Open
          <ArrowRight
            className="size-4 transition-transform group-hover:translate-x-0.5"
            aria-hidden
          />
        </span>
      </Link>

      <SettingsCard
        title="Connection"
        description="Status of your WhatsApp Cloud API integration."
      >
        <WhatsappStatus
          active={settings.whatsappWebhookActive}
          healthy={settings.whatsappHealthy}
          lastError={settings.whatsappLastError}
        />
      </SettingsCard>

      <SettingsCard
        title="Webhook configuration"
        description="Paste these into your Meta App webhook setup so messages reach Acroma."
      >
        <CopyField
          label="Webhook URL"
          value={settings.webhookUrl}
          helper="Set this as the callback URL in Meta App → WhatsApp → Configuration."
        />
        <CopyField
          label="Verify token"
          value={settings.whatsappVerifyToken}
          helper="Paste this as the verify token alongside the URL."
        />
      </SettingsCard>

      <SettingsCard
        title="Credentials"
        description="Add or rotate the credentials Acroma uses to talk to your WhatsApp number."
        footer={
          <WhatsappTestButton disabled={!settings.whatsappWebhookActive} />
        }
      >
        <WhatsappForm
          defaults={{
            phoneNumberId: settings.whatsappPhoneNumberId,
            businessAccountId: settings.whatsappBusinessAccountId,
          }}
        />
      </SettingsCard>
    </div>
  );
}
