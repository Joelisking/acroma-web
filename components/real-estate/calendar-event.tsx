"use client"
import { cn } from "@/lib/utils"
import type { Appointment } from "@/lib/real-estate"
import { clockTime, statusLabel } from "@/lib/estate-calendar"
import { refundLabel } from "@/lib/estate-refunds"

export function CalendarEvent({
  appointment: a,
  title,
  compact = false,
  day,
  onClick,
}: {
  appointment: Appointment
  title?: string
  compact?: boolean
  day?: string
  onClick: () => void
}) {
  const inactive = a.status === "CANCELLED" || a.status === "EXPIRED"
  const time =
    day && a.startsAt.slice(0, 10) < day ? "Continues" : clockTime(a.startsAt)
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={`${time} ${a.kind === "VIEWING" ? "Viewing" : "Consultation"}, ${a.customerName}, ${statusLabel(a)}`}
      className={cn(
        "h-full w-full min-w-0 rounded-md border-l-4 px-2 py-1 text-left text-xs leading-snug transition-colors focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none",
        inactive
          ? "border-muted-foreground/40 bg-muted text-muted-foreground"
          : a.kind === "VIEWING"
            ? "border-brand-blue bg-brand-blue-soft text-foreground"
            : "border-brand-green bg-brand-green-soft text-foreground"
      )}
    >
      <span
        className={cn(
          "block truncate font-semibold",
          inactive && "line-through"
        )}
      >
        {time} {a.kind === "VIEWING" ? "Viewing" : "Consultation"}
      </span>
      {!compact && (
        <span className="block truncate">
          {a.customerName}
          {title ? ` · ${title}` : ""}
        </span>
      )}
      <span className="block truncate">
        {statusLabel(a)}
        {a.fee === 0
          ? " · Free"
          : a.paymentStatus === "PAID"
            ? " · Paid"
            : a.paymentStatus === "REFUND_REQUIRED" || a.paymentStatus === "REFUNDED"
              ? ` · ${refundLabel(a)}`
              : ""}
      </span>
    </button>
  )
}
