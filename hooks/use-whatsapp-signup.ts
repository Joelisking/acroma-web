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
    if (result.ok && result.data.attemptId === currentId.current)
      setProgress(result.data)
    else if (!result.ok) setError(result.error)
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
    if (attempt) {
      const cancelled = await cancelWhatsappSignup(
        attempt.attemptId,
        attempt.nonce
      )
      if (
        !cancelled.ok ||
        !["CANCELLED", "EXPIRED", "FAILED", "ACTION_REQUIRED"].includes(
          cancelled.data.status
        )
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
    try {
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
    } catch {
      setError("Could not load Meta. Allow popups and try again.")
    } finally {
      if (mounted.current) setBusy(false)
    }
  }
  function launch() {
    if (!attempt || !window.FB || active.current) return
    if (Date.parse(attempt.expiresAt) <= Date.now()) {
      return setError("Setup expired. Prepare a new connection.")
    }
    active.current = true
    popupPending.current = true
    setError("")
    setProgress({
      attemptId: attempt.attemptId,
      status: "AWAITING_META",
      message: "Complete the WhatsApp setup window.",
    })
    try {
      window.FB.login(
        (response) => {
          if (!mounted.current || currentId.current !== attempt.attemptId)
            return
          popupPending.current = false
          const code = response.authResponse?.code
          if (typeof code !== "string" || !code) {
            setError(
              "Meta did not return authorization. Prepare a new connection to retry."
            )
            return
          }
          receivedCode.current = true
          void sendSignupCode(attempt.attemptId, attempt.nonce, code).then(
            apply
          )
        },
        {
          config_id: attempt.configurationId,
          response_type: "code",
          override_default_response_type: true,
          extras: { setup: {} },
        }
      )
    } catch {
      active.current = false
      setError(
        "Meta could not open. Allow popups and prepare a new connection."
      )
    }
  }
  async function submitPin(pin: string) {
    if (!attempt || busy) return
    setBusy(true)
    setError("")
    try {
      apply(await resumeWhatsappSignup(attempt.attemptId, attempt.nonce, pin))
    } finally {
      setBusy(false)
    }
  }
  return { prepare, launch, submitPin, attempt, progress, error, busy }
}
