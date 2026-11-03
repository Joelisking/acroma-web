"use client"
import { useEffect, type MutableRefObject } from "react"
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
import { useImpersonation } from "@/components/impersonation/impersonation-provider"
import { useConfirmedAction } from "@/components/impersonation/use-confirmed-action"
import {
  startSignupPolling,
  signupStopped,
} from "@/lib/whatsapp/signup-polling"
import { SIGNUP_CONFIRM } from "@/lib/whatsapp/signup-confirm"
import { parseSignupEvent } from "@/lib/whatsapp/signup-events"
export function useWhatsappSignupProgress(
  attempt: SignupStart | undefined,
  progress: SignupProgress | undefined,
  active: MutableRefObject<boolean>,
  receivedCode: MutableRefObject<boolean>,
  apply: (result: SignupAction<SignupProgress>) => void,
  setError: (message: string) => void
) {
  const confirm = useConfirmedAction()
  const impersonating = useImpersonation() !== null
  useEffect(() => {
    if (!attempt) return
    const listener = (event: MessageEvent<unknown>) => {
      if (!active.current || !event.source || event.source === window) return
      const parsed = parseSignupEvent(event)
      if (!parsed) return
      if (parsed.kind === "selection") {
        void confirm(SIGNUP_CONFIRM.selection, () =>
          sendSignupSelection(attempt.attemptId, attempt.nonce, parsed.selection)
        ).then((result) => {
          if (result) apply(result)
        })
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
  }, [attempt, active, receivedCode, apply, setError, confirm])
  useEffect(() => {
    if (!attempt || !progress || signupStopped(progress.status)) return
    // Impersonating: VALIDATING needs a confirmed "Check result" click, so
    // stop polling instead of looping on a read that cannot advance it.
    if (impersonating && progress.status === "VALIDATING") return
    return startSignupPolling({
      read: () => getSignupProgress(attempt.attemptId),
      // Automatic background write: while an admin is logged in as the
      // merchant it is skipped (read only) so no change goes out unconfirmed.
      // The explicit resume / PIN buttons are confirmed in useWhatsappSignup.
      resume: () =>
        impersonating
          ? getSignupProgress(attempt.attemptId)
          : resumeWhatsappSignup(attempt.attemptId, attempt.nonce),
      apply,
      schedule: (fn, delay) => window.setTimeout(fn, delay),
      cancel: (timer) => window.clearTimeout(timer),
    })
  }, [attempt, progress, apply, impersonating])
}
