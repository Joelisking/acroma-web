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
 * Tiny external store for the open dialog.
 *
 * Why not `useState`: callers usually run `confirm(...)` inside
 * `startTransition(async () => ...)`. A `setState` made synchronously in that
 * scope joins the transition, and React holds it back until the transition's
 * action resolves. The action is awaiting this very dialog, so the dialog
 * would never appear (deadlock). Updates delivered through
 * `useSyncExternalStore` are always rendered synchronously and never join a
 * transition, so the dialog opens no matter where `confirm` is called from.
 */
function createDialogStore() {
  let pending: Pending | null = null
  let resolver: ((ok: boolean) => void) | null = null
  let nextId = 0
  const listeners = new Set<() => void>()
  const emit = () => listeners.forEach((listener) => listener())

  return {
    subscribe(listener: () => void) {
      listeners.add(listener)
      return () => {
        listeners.delete(listener)
      }
    },
    get: () => pending,
    getServer: () => null,
    request(spec: ConfirmSpec): Promise<boolean> {
      // One dialog at a time: a second request while one is open (e.g. a
      // double click) is treated as cancelled rather than queued.
      if (resolver) return Promise.resolve(false)
      return new Promise<boolean>((resolve) => {
        resolver = resolve
        nextId += 1
        pending = { id: nextId, spec }
        emit()
      })
    },
    settle(ok: boolean) {
      const resolve = resolver
      resolver = null
      pending = null
      emit()
      resolve?.(ok)
    },
  }
}

/**
 * Hosts the single confirm dialog used while a super admin is logged in as a
 * merchant. Mount inside `ImpersonationProvider`. Outside impersonation it
 * renders nothing extra and `useConfirmedAction` never asks it for anything.
 */
export function ConfirmProvider({ children }: { children: React.ReactNode }) {
  const impersonation = useImpersonation()
  const [store] = React.useState(createDialogStore)
  const pending = React.useSyncExternalStore(
    store.subscribe,
    store.get,
    store.getServer
  )

  // Never leave a caller hanging if the provider unmounts mid-dialog.
  React.useEffect(() => () => store.settle(false), [store])

  return (
    <ConfirmContext.Provider value={store.request}>
      {children}
      {impersonation && (
        <ConfirmDialog
          key={pending?.id ?? 0}
          spec={pending?.spec ?? null}
          businessName={impersonation.businessName}
          onSettle={store.settle}
        />
      )}
    </ConfirmContext.Provider>
  )
}

/** The provider's request function, or null when no provider is mounted. */
export function useConfirmRequest(): RequestConfirm | null {
  return React.useContext(ConfirmContext)
}
