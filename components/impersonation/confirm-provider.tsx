"use client"

import * as React from "react"

import type { ConfirmSpec } from "@/lib/impersonation-confirm"

import { ConfirmDialog } from "./confirm-dialog"
import { useImpersonation } from "./impersonation-provider"

/** Opens the confirm dialog; resolves true on confirm, false on cancel. */
type RequestConfirm = (spec: ConfirmSpec) => Promise<boolean>

const ConfirmContext = React.createContext<RequestConfirm | null>(null)

type Pending = { id: number; spec: ConfirmSpec }

/**
 * Hosts the single confirm dialog used while a super admin is logged in as a
 * merchant. Mount inside `ImpersonationProvider`. Outside impersonation it
 * renders nothing extra and `useConfirmedAction` never asks it for anything.
 */
export function ConfirmProvider({ children }: { children: React.ReactNode }) {
  const impersonation = useImpersonation()
  const [pending, setPending] = React.useState<Pending | null>(null)
  const resolverRef = React.useRef<((ok: boolean) => void) | null>(null)
  const nextId = React.useRef(0)

  const settle = React.useCallback((ok: boolean) => {
    const resolve = resolverRef.current
    resolverRef.current = null
    setPending(null)
    resolve?.(ok)
  }, [])

  const request = React.useCallback<RequestConfirm>((spec) => {
    // One dialog at a time: a second request while one is open (e.g. a
    // double click) is treated as cancelled rather than queued.
    if (resolverRef.current) return Promise.resolve(false)
    return new Promise<boolean>((resolve) => {
      resolverRef.current = resolve
      nextId.current += 1
      setPending({ id: nextId.current, spec })
    })
  }, [])

  // Never leave a caller hanging if the provider unmounts mid-dialog.
  React.useEffect(() => () => resolverRef.current?.(false), [])

  return (
    <ConfirmContext.Provider value={request}>
      {children}
      {impersonation && (
        <ConfirmDialog
          key={pending?.id ?? 0}
          spec={pending?.spec ?? null}
          businessName={impersonation.businessName}
          onSettle={settle}
        />
      )}
    </ConfirmContext.Provider>
  )
}

/** The provider's request function, or null when no provider is mounted. */
export function useConfirmRequest(): RequestConfirm | null {
  return React.useContext(ConfirmContext)
}
