import { SettingsSectionsLayout } from "@/components/settings/settings-sections-layout"
import { PageHeader } from "@/components/shared/page-header"
import { readRole } from "@/lib/api/cookies"
import { getCurrentBusiness } from "@/lib/api/business"

export default async function SettingsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [role, business] = await Promise.all([readRole(), getCurrentBusiness()])

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <PageHeader
        title="Settings"
        description="Connect channels, configure payments, and tune Acroma to your business."
      />

      <SettingsSectionsLayout role={role} businessType={business?.businessType}>
        {children}
      </SettingsSectionsLayout>
    </div>
  )
}
