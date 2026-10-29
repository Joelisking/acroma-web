import Link from "next/link"
import { ArrowRight, TriangleAlert } from "lucide-react"
import { Button } from "@/components/ui/button"

type WhatsappReconnectBannerProps = {
  /** Why the connection broke, from the health check; falls back to a generic line. */
  reason?: string | null
}

/**
 * Dashboard-wide strip shown while a connected WhatsApp number is unhealthy,
 * so the owner sees it on every screen rather than only in settings. It goes
 * away on its own once a reconnect marks the connection healthy again.
 */
export function WhatsappReconnectBanner({
  reason,
}: WhatsappReconnectBannerProps) {
  return (
    <div
      role="alert"
      className="flex flex-col gap-3 border-b border-destructive/30 bg-destructive/5 px-4 py-3 sm:flex-row sm:items-center sm:px-6 lg:px-10"
    >
      <div className="flex min-w-0 flex-1 items-start gap-3">
        <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-destructive/10 text-destructive">
          <TriangleAlert className="size-4" aria-hidden />
        </span>
        <div className="min-w-0">
          <p className="text-sm font-medium text-destructive">
            WhatsApp needs reconnecting
          </p>
          <p className="text-xs text-destructive/80">
            {reason?.trim() ||
              "Acroma can't reply to customers on your WhatsApp number right now. Reconnect it to turn AI replies back on."}
          </p>
        </div>
      </div>
      <Button
        asChild
        size="sm"
        variant="destructive"
        className="self-start sm:self-auto"
      >
        <Link href="/dashboard/settings/whatsapp">
          Reconnect
          <ArrowRight data-icon="inline-end" aria-hidden />
        </Link>
      </Button>
    </div>
  )
}
