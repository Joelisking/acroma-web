import { format } from "date-fns"
import type { PillTone } from "@/components/shared/status-pill"
import type { Promotion, PromotionStatus } from "@/lib/api/types"

const STATUS: Record<PromotionStatus, { label: string; tone: PillTone }> = {
  DRAFT: { label: "Draft", tone: "muted" },
  SCHEDULED: { label: "Scheduled", tone: "blue" },
  LIVE: { label: "Live", tone: "green" },
  ENDED: { label: "Ended", tone: "muted" },
}

export function promotionStatusPill(status: PromotionStatus) {
  return STATUS[status]
}

/** "Starts Sat 24 Oct, 7:00 pm · ends Sun 25 Oct, 11:00 pm", or "". */
export function promotionWindow(p: Pick<Promotion, "startsAt" | "endsAt">) {
  const fmt = (iso: string) => format(new Date(iso), "EEE d MMM, h:mm a")
  const parts = [
    p.startsAt ? `starts ${fmt(p.startsAt)}` : null,
    p.endsAt ? `ends ${fmt(p.endsAt)}` : null,
  ].filter(Boolean) as string[]
  if (!parts.length) return ""
  const text = parts.join(" · ")
  return text.charAt(0).toUpperCase() + text.slice(1)
}

/** ISO → the DateTimePicker's local "YYYY-MM-DDTHH:mm", "" when unset. */
export function toPickerValue(iso: string | null): string {
  return iso ? format(new Date(iso), "yyyy-MM-dd'T'HH:mm") : ""
}

/** DateTimePicker value → ISO, null when cleared. */
export function fromPickerValue(value: string): string | null {
  return value ? new Date(value).toISOString() : null
}

/** Label for one variant: "Large", "Pork / Large". */
export function variantLabel(attributes: Record<string, string>): string {
  return Object.values(attributes).join(" / ")
}

/** Ended because its end date passed (switching it on alone won't restart it). */
export function hasEndedByDate(
  p: Pick<Promotion, "status" | "endsAt">,
  now: Date = new Date()
): boolean {
  return (
    p.status === "ENDED" &&
    !!p.endsAt &&
    new Date(p.endsAt).getTime() <= now.getTime()
  )
}
