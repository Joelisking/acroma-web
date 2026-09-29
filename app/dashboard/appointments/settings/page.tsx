import type { Metadata } from "next"
import { estateSettings, requireEstate } from "@/lib/api/real-estate"
import { EstateSettingsForm } from "@/components/real-estate/estate-settings-form"
import { CalendarViewSettingsForm } from "@/components/real-estate/calendar-view-settings-form"
import { PageHeader } from "@/components/shared/page-header"
import { OpeningHoursForm } from "@/components/settings/opening-hours-form"
import { SettingsCard } from "@/components/settings/settings-card"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { readRole } from "@/lib/api/cookies"
import { redirectStaffHome } from "@/lib/api/owner-only"
import { SettingsSectionsLayout } from "@/components/settings/settings-sections-layout"
export const metadata: Metadata = { title: "Appointment settings · Acroma" }
export default async function AppointmentSettingsPage() {
  await redirectStaffHome()
  const business = await requireEstate()
  const [role, settings] = await Promise.all([readRole(), estateSettings()])
  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <Link
        href="/dashboard/appointments"
        className="inline-flex min-h-9 items-center gap-2 rounded-md text-sm font-medium text-muted-foreground transition-colors hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
      >
        <ArrowLeft className="size-4" aria-hidden="true" />
        Agency calendar
      </Link>
      <PageHeader
        title="Appointment settings"
        description="Manage shared availability, viewing and consultation settings in one place. All times use Ghana time (UTC)."
      />
      <SettingsSectionsLayout role={role} businessType={business.businessType}>
        <SettingsCard
          title="Calendar view"
          description="Choose the view your agency opens by default."
        >
          <CalendarViewSettingsForm
            defaultView={settings.defaultCalendarView}
          />
        </SettingsCard>
        <SettingsCard
          title="Shared availability"
          description="These weekly hours apply to both viewings and consultations. Each day has one opening and closing time. Save availability separately from fees and durations."
        >
          <OpeningHoursForm
            initial={business.openingHours}
            purpose="appointments"
          />
        </SettingsCard>
        <SettingsCard
          title="Appointment types"
          description="Set a fee and duration for each type. Both use the same agency calendar."
        >
          <EstateSettingsForm settings={settings} />
        </SettingsCard>
      </SettingsSectionsLayout>
    </div>
  )
}
