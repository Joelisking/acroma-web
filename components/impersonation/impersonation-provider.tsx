"use client"

import * as React from "react"

import type { Impersonation } from "@/lib/api/impersonation"

const ImpersonationContext = React.createContext<Impersonation | null>(null)

type Props = {
  value: Impersonation | null
  children: React.ReactNode
}

/**
 * Tells client code whether a super admin is acting as this merchant, so
 * background work the user didn't ask for (e.g. web-push re-subscribe) can
 * switch itself off. Display data only: it never carries a token.
 */
export function ImpersonationProvider({ value, children }: Props) {
  return (
    <ImpersonationContext.Provider value={value}>
      {children}
    </ImpersonationContext.Provider>
  )
}

export function useImpersonation(): Impersonation | null {
  return React.useContext(ImpersonationContext)
}
