"use client"
import { useEffect, useRef, type MutableRefObject } from "react"
import {
  getSignupProgress,
  resumeWhatsappSignup,
  sendSignupSelection,
} from "@/lib/api/whatsapp-onboarding-actions"
import type {
  SignupAction,
  SignupProgress,
  SignupStart,
} from "@/lib/api/whatsapp-onboarding"
import { parseSignupEvent } from "@/lib/whatsapp/signup-events"
export function useWhatsappSignupProgress(
  attempt: SignupStart | undefined,
  progress: SignupProgress | undefined,
  active: MutableRefObject<boolean>,
  receivedCode: MutableRefObject<boolean>,
  apply: (result: SignupAction<SignupProgress>) => void,
  setError: (message: string) => void
) {
  const resuming = useRef(false)
  useEffect(() => {
    if (!attempt) return
    const listener = (event: MessageEvent<unknown>) => {
      if (!active.current || !event.source || event.source === window) return
      const parsed = parseSignupEvent(event)
      if (!parsed) return
      if (parsed.kind === "selection") {
        void sendSignupSelection(
          attempt.attemptId,
          attempt.nonce,
          parsed.selection
        ).then(apply)
      } else if (parsed.kind === "unsupported") {
        setError(
          "This account needs a different setup flow. Your current sender has not been changed."
        )
      } else if (!receivedCode.current) {
        setError(
          "Complete the Meta setup window, or prepare a new connection to try again."
        )
      }
    }
    window.addEventListener("message", listener)
    return () => window.removeEventListener("message", listener)
  }, [attempt, active, receivedCode, apply, setError])
  useEffect(() => {
    if (
      !attempt ||
      !progress ||
      [
        "CONNECTED",
        "ACTION_REQUIRED",
        "FAILED",
        "CANCELLED",
        "EXPIRED",
      ].includes(progress.status)
    )
      return
    let cancelled = false
    const timer = window.setTimeout(() => {
      if (progress.status === "VALIDATING" && !resuming.current) {
        resuming.current = true
        void resumeWhatsappSignup(attempt.attemptId, attempt.nonce)
          .then((result) => {
            if (!cancelled) apply(result)
          })
          .finally(() => {
            resuming.current = false
          })
      } else {
        void getSignupProgress(attempt.attemptId).then((result) => {
          if (!cancelled) apply(result)
        })
      }
    }, 1500)
    return () => {
      cancelled = true
      window.clearTimeout(timer)
    }
  }, [attempt, progress, apply])
}
