import type { Metadata } from "next"
import Link from "next/link"
import { ArrowRight, BookOpen } from "lucide-react"

import { getWhatsappSettings } from "@/lib/api/settings"
import { listTemplates } from "@/lib/api/templates"
import { findTillPaymentTemplate } from "@/lib/till-template"
import { SettingsCard } from "@/components/settings/settings-card"
import { WhatsappStatus } from "@/components/settings/whatsapp-status"
import { WhatsappForm } from "@/components/settings/whatsapp-form"
import { WhatsappTestButton } from "@/components/settings/whatsapp-test-button"
import { CopyField } from "@/components/settings/copy-field"
import { TillTemplateSetup } from "@/components/settings/till-template-setup"
import { redirectStaffHome } from "@/lib/api/owner-only"

export const metadata: Metadata = { title: "WhatsApp · Settings · Acroma" }

export default async function WhatsappSettingsPage() {
  await redirectStaffHome()

  const settings = await getWhatsappSettings()
  // A merchant who has not connected WhatsApp has no WABA to hold a template,
  // and the backend refuses the sync, so don't ask for one.
  const templates = settings.whatsappBusinessAccountId
    ? await listTemplates()
    : []
  const tillTemplate = findTillPaymentTemplate(templates)

  return (
    <div className="space-y-6">
      <SettingsCard
        title="Connect with Meta"
        description="Connect a merchant-owned WhatsApp account without copying access tokens."
      >
        <Link
          href="/whatsapp/connect"
          className="text-sm font-medium text-primary"
        >
          Connect WhatsApp
        </Link>
      </SettingsCard>
      {!settings.connection && (
        <Link
          href="/dashboard/settings/whatsapp/guide"
          className="group flex items-center gap-3 rounded-2xl border border-border/70 bg-card p-4 transition-colors hover:border-brand-orange/40"
        >
          <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-brand-orange/15 text-brand-orange">
            <BookOpen className="size-4.5" aria-hidden />
          </span>
          <div className="min-w-0 flex-1 space-y-0.5">
            <p className="text-sm font-medium text-foreground">
              New to WhatsApp Cloud API? Read the setup guide.
            </p>
            <p className="text-xs leading-relaxed text-muted-foreground">
              Step-by-step: where to find your phone number ID, business account
              ID, and how to generate a permanent access token.
            </p>
          </div>
          <span className="inline-flex shrink-0 items-center gap-1 text-sm font-medium text-brand-orange">
            Open
            <ArrowRight
              className="size-4 transition-transform group-hover:translate-x-0.5"
              aria-hidden
            />
          </span>
        </Link>
      )}

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
        title="Counter payment links"
        description="Let the till send a payment link to a customer who has never messaged you."
      >
        <TillTemplateSetup
          status={tillTemplate?.status ?? null}
          connected={!!settings.whatsappBusinessAccountId}
        />
      </SettingsCard>

      {!settings.connection && (
        <>
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
        </>
      )}
      {settings.connection && (
        <SettingsCard
          title="Managed connection"
          description="Connected through Meta signup."
        >
          <p className="text-sm">
            {settings.connection.displayPhoneNumber} ·{" "}
            {settings.connection.status}
          </p>
          <p className="text-sm text-muted-foreground">
            Contact support to reconnect or change this sender.
          </p>
        </SettingsCard>
      )}
    </div>
  )
}
