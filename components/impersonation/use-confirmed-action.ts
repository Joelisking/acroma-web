"use client"

import * as React from "react"

import {
  clearConfirmCookie,
  setConfirmCookie,
  type ConfirmSpec,
} from "@/lib/impersonation-confirm"

import { useConfirmRequest } from "./confirm-provider"
import { useImpersonation } from "./impersonation-provider"

export type { ConfirmSpec }

export type ConfirmedAction = <T>(
  spec: ConfirmSpec,
  run: () => Promise<T>
) => Promise<T | undefined>

/**
 * Wrap every mutating server-action call:
 *
 *   const confirm = useConfirmedAction()
 *   const result = await confirm({ title: "Save item changes" }, () => save(x))
 *   if (result === undefined) return // cancelled (or run returned undefined)
 *
 * - Not impersonating (or no ConfirmProvider mounted): runs `run()` directly.
 * - Impersonating: shows the confirm dialog. Cancel resolves `undefined`
 *   without calling `run`. Confirm sets the short-lived `acroma_confirm`
 *   cookie so `apiFetch` sends `x-acroma-confirmed: 1`, awaits `run()`, and
 *   always clears the cookie afterwards, even if `run()` throws.
 */
export function useConfirmedAction(): ConfirmedAction {
  const impersonation = useImpersonation()
  const request = useConfirmRequest()

  return React.useCallback<ConfirmedAction>(
    async (spec, run) => {
      if (!impersonation || !request) return run()

      const ok = await request(spec)
      if (!ok) return undefined

      setConfirmCookie()
      try {
        return await run()
      } finally {
        clearConfirmCookie()
      }
    },
    [impersonation, request]
  )
}
