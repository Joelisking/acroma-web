import { ShieldAlert } from "lucide-react"

import { Button } from "@/components/ui/button"
import type { Impersonation } from "@/lib/api/impersonation"

type Props = {
  impersonation: Impersonation
}

// Admins work from Ghana; GMT keeps server and browser rendering identical.
const endsAt = new Intl.DateTimeFormat("en-GB", {
  hour: "2-digit",
  minute: "2-digit",
  timeZone: "Africa/Accra",
  timeZoneName: "short",
})

/**
 * Unmissable bar shown on every dashboard page while a super admin is acting
 * as a merchant. Exit is a plain form POST so it works before hydration.
 */
export function ImpersonationBanner({ impersonation }: Props) {
  const ends = endsAt.format(new Date(impersonation.expiresAt))

  return (
    <div
      role="status"
      className="sticky top-0 z-40 flex shrink-0 items-center justify-between gap-3 bg-brand-navy px-4 py-2 text-sm text-secondary-foreground sm:px-6"
    >
      <p className="flex min-w-0 items-center gap-2">
        <ShieldAlert aria-hidden className="size-4 shrink-0" />
        <span className="min-w-0">
          Acting as{" "}
          <strong className="font-semibold">
            {impersonation.businessName}
          </strong>{" "}
          as Acroma admin · ends {ends}
        </span>
      </p>
      <form
        method="post"
        action="/api/admin/impersonate/end"
        className="shrink-0"
      >
        <Button type="submit" size="sm">
          Exit
        </Button>
      </form>
    </div>
  )
}
