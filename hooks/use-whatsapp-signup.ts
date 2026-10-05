"use client"
import { useCallback, useEffect, useRef, useState } from "react"
import {
  resumeWhatsappSignup,
  sendSignupCode,
  startWhatsappSignup,
  cancelWhatsappSignup,
} from "@/lib/api/whatsapp-onboarding-actions"
import type {
  SignupAction,
  SignupProgress,
  SignupStart,
} from "@/lib/api/whatsapp-onboarding"
import { launchSignup } from "@/lib/whatsapp/signup-launch"
import { useWhatsappSignupProgress } from "./use-whatsapp-signup-progress"
import {
  loadFacebookSDK,
  initializeSignupSDK,
} from "@/lib/whatsapp/facebook-sdk"
export function useWhatsappSignup() {
  const [attempt, setAttempt] = useState<SignupStart>()
  const [progress, setProgress] = useState<SignupProgress>()
  const [error, setError] = useState("")
  const [busy, setBusy] = useState(false)
  const active = useRef(false)
  const mounted = useRef(true)
  const currentId = useRef<string | undefined>(undefined)
  const receivedCode = useRef(false)
  const popupPending = useRef(false)
  useEffect(() => {
    mounted.current = true
    return () => {
      mounted.current = false
      active.current = false
    }
  }, [])
  const apply = useCallback((result: SignupAction<SignupProgress>) => {
    if (!mounted.current) return
    if (result.ok && result.data.attemptId === currentId.current) {
      setError("")
      setProgress((previous) =>
        previous?.status === "CONNECTED" ? previous : result.data
      )
    } else if (!result.ok) setError(result.error)
  }, [])
  useWhatsappSignupProgress(
    attempt,
    progress,
    active,
    receivedCode,
    apply,
    setError
  )
  async function prepare() {
    if (busy) return
    if (popupPending.current)
      return setError("Finish or close the Meta setup window before retrying.")
    setBusy(true)
    try {
      if (attempt) {
        const cancelled = await cancelWhatsappSignup(
          attempt.attemptId,
          attempt.nonce
        )
        if (
          !cancelled.ok ||
          !["CANCELLED", "EXPIRED", "FAILED"].includes(cancelled.data.status)
        ) {
          apply(cancelled)
          setError(
            "This connection is still completing. Wait for its result before starting again."
          )
          setBusy(false)
          return
        }
      }
      active.current = false
      currentId.current = undefined
      receivedCode.current = false
      setError("")
      setProgress(undefined)
      setAttempt(undefined)
      const sdk = await loadFacebookSDK()
      const result = await startWhatsappSignup()
      if (!result.ok) {
        setError(result.error)
        return
      }
      initializeSignupSDK(sdk, result.data)
      if (!mounted.current) return
      currentId.current = result.data.attemptId
      setAttempt(result.data)
      setProgress(result.data.progress)
    } catch {
      setError("Could not load Meta. Allow popups and try again.")
    } finally {
      if (mounted.current) setBusy(false)
    }
  }
  const launch = (keepBusinessApp: boolean) =>
    launchSignup(
      window.FB,
      attempt,
      { active, mounted, currentId, receivedCode, popupPending },
      (code) => {
        if (attempt)
          void sendSignupCode(attempt.attemptId, attempt.nonce, code).then(
            apply
          )
      },
      setProgress,
      setError,
      keepBusinessApp
    )
  async function submitPin(pin?: string) {
    if (!attempt || busy) return
    setBusy(true)
    setError("")
    try {
      apply(await resumeWhatsappSignup(attempt.attemptId, attempt.nonce, pin))
    } catch {
      setError("Connection interrupted. Resume this setup to check its result.")
    } finally {
      setBusy(false)
    }
  }
  return { prepare, launch, submitPin, attempt, progress, error, busy }
}
