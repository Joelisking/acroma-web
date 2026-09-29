import Link from "next/link"
import type { Metadata } from "next"
import { z } from "zod"
import {
  listAppointments,
  listProperties,
  requireEstate,
  estateRefunds,
  estateAppointment,
  estateSettings,
} from "@/lib/api/real-estate"
import { calendarRange, resolveCalendarView } from "@/lib/estate-calendar"
import { AgencyCalendar } from "@/components/real-estate/agency-calendar"
import { PageHeader } from "@/components/shared/page-header"
import { Button } from "@/components/ui/button"
import { LiveRefresh } from "@/components/conversations/live-refresh"
export const metadata: Metadata = { title: "Agency calendar · Acroma" }
export default async function AppointmentsPage({
  searchParams,
}: {
  searchParams: Promise<{ day?: string; view?: string; appointment?: string }>
}) {
  const business = await requireEstate()
  const sp = await searchParams
  const now = new Date().getTime()
  const day = z.iso
    .date()
    .catch(new Date(now).toISOString().slice(0, 10))
    .parse(sp.day)
  const settings = await estateSettings()
  const view = resolveCalendarView(sp.view, settings.defaultCalendarView)
  const { from, to } = calendarRange(day, view)
  const selectedId = z.uuid().catch("").parse(sp.appointment)
  const [appointments, properties, refunds, selectedAppointment] =
    await Promise.all([
      listAppointments(from, to),
      listProperties(),
      estateRefunds(),
      selectedId ? estateAppointment(selectedId) : Promise.resolve(null),
    ])
  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <PageHeader
        title="Agency calendar"
        description="Manage property viewings and consultations in one shared calendar."
        actions={
          <Button asChild variant="outline">
            <Link href="/dashboard/appointments/settings">
              Appointment settings
            </Link>
          </Button>
        }
      />
      {!business.openingHours && (
        <p className="rounded-xl bg-accent p-4 text-sm">
          Your agency is always open for appointments. Set weekly hours in{" "}
          <Link
            href="/dashboard/appointments/settings"
            className="font-medium underline"
          >
            Appointment settings
          </Link>{" "}
          to limit availability.
        </p>
      )}
      <AgencyCalendar
        appointments={appointments}
        properties={properties}
        refunds={refunds}
        day={day}
        view={view}
        initialNow={now}
        selectedAppointment={selectedAppointment}
      />
      <LiveRefresh businessId={business.id} events={["estate_updated"]} />
    </div>
  )
}
