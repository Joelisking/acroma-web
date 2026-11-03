"use client"

import * as React from "react"
import { ArrowRight, MessageCircle } from "lucide-react"

import { Button } from "@/components/ui/button"
import { useImpersonation } from "@/components/impersonation/impersonation-provider"
import { useConfirmedAction } from "@/components/impersonation/use-confirmed-action"
import { completeOnboardingAndConnectWhatsappAction } from "@/lib/api/onboarding-actions"

/**
 * Client wrapper for the "Connect WhatsApp" form so an admin logged in as the
 * merchant has to confirm. Everyone else gets the same plain form action as
 * before (progressive enhancement and all).
 */
export function ConnectWhatsappForm() {
  const impersonating = useImpersonation() !== null
  const confirm = useConfirmedAction()
  const [, startTransition] = React.useTransition()

  const button = (
    <Button
      type="submit"
      className="h-11 gap-2 rounded-xl bg-brand-orange px-5 text-sm hover:bg-brand-orange/90"
    >
      <MessageCircle />
      Connect WhatsApp
      <ArrowRight />
    </Button>
  )

  if (!impersonating) {
    return (
      <form action={completeOnboardingAndConnectWhatsappAction}>{button}</form>
    )
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault()
        startTransition(async () => {
          await confirm(
            {
              title: "Finish onboarding and go to WhatsApp setup",
              description: "Onboarding is marked complete first.",
            },
            () => completeOnboardingAndConnectWhatsappAction()
          )
        })
      }}
    >
      {button}
    </form>
  )
}
