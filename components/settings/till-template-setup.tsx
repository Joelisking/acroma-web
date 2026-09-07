"use client"

import * as React from "react"
import {
  Check,
  Clock,
  Loader2,
  RefreshCw,
  TriangleAlert,
  Zap,
} from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { createTillPaymentTemplateAction } from "@/lib/api/templates-actions"
import type { WhatsappTemplateStatus } from "@/lib/api/types"

type Props = {
  /** Null when the template has never been registered on this WABA. */
  status: WhatsappTemplateStatus | null
  /** Registering needs the WhatsApp credentials the template lives under. */
  connected: boolean
}

/**
 * Turn on counter payment links.
 *
 * Whether the till can message a walk-in at all comes down to one approved
 * template, and a merchant has no way to know that. So this card says what the
 * button buys them, and then reports Meta's review honestly rather than
 * claiming the feature is on the moment it is registered.
 */
export function TillTemplateSetup({ status, connected }: Props) {
  const [pending, startTransition] = React.useTransition()

  function setUp() {
    startTransition(async () => {
      const result = await createTillPaymentTemplateAction()
      if (!result.ok) {
        toast.error(result.error)
        return
      }
      toast.success(
        result.data.status === "APPROVED"
          ? "Counter payment links are on."
          : "Still waiting on WhatsApp to approve it. Usually a few minutes."
      )
    })
  }

  if (status === "APPROVED") {
    return (
      <Note tone="green" icon={<Check className="size-4" />}>
        On. The till can send a payment link to any customer, whether or not
        they have messaged you before.
      </Note>
    )
  }

  if (status === "PENDING") {
    return (
      <div className="space-y-3">
        <Note tone="orange" icon={<Clock className="size-4" />}>
          Waiting for WhatsApp to approve it, usually a few minutes. Until then
          the till falls back to the QR for customers who have not messaged you
          in the last 24 hours.
        </Note>
        {/* Approval happens at Meta and nothing tells us, so the merchant needs
            a way to ask. Without this the card reads "waiting" forever. */}
        <Button
          onClick={setUp}
          disabled={pending}
          variant="outline"
          size="sm"
          className="gap-2"
        >
          {pending ? (
            <Loader2 className="animate-spin" />
          ) : (
            <RefreshCw className="size-4" />
          )}
          Check again
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {status === "REJECTED" || status === "DISABLED" ? (
        <Note tone="red" icon={<TriangleAlert className="size-4" />}>
          WhatsApp turned this template down. Contact support before trying
          again, so the same wording is not resubmitted.
        </Note>
      ) : (
        <p className="text-sm leading-relaxed text-muted-foreground">
          WhatsApp only lets you send a plain message to someone who has written
          to you in the last 24 hours, which a walk-in at your counter usually
          has not. Turning this on lets the till send them a payment link
          anyway.
        </p>
      )}
      <Button
        onClick={setUp}
        disabled={pending || !connected}
        variant="outline"
        className="gap-2"
      >
        {pending ? <Loader2 className="animate-spin" /> : <Zap />}
        Turn on counter payment links
      </Button>
      {!connected ? (
        <p className="text-xs text-muted-foreground">
          Connect WhatsApp first, above.
        </p>
      ) : null}
    </div>
  )
}

const TONES = {
  green: "bg-brand-green-soft text-brand-green",
  orange: "bg-brand-orange-soft text-brand-orange",
  red: "bg-destructive/10 text-destructive",
} as const

function Note({
  tone,
  icon,
  children,
}: {
  tone: keyof typeof TONES
  icon: React.ReactNode
  children: React.ReactNode
}) {
  return (
    <div className="flex items-start gap-2.5">
      <span
        className={`flex size-7 shrink-0 items-center justify-center rounded-lg ${TONES[tone]}`}
        aria-hidden
      >
        {icon}
      </span>
      <p className="text-sm leading-relaxed text-muted-foreground">
        {children}
      </p>
    </div>
  )
}
