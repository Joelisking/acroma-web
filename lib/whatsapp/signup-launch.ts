import type { FacebookSDK } from "./facebook-sdk"
import type { SignupStart, SignupProgress } from "../api/whatsapp-onboarding"
type Ref<T> = { current: T }
export function launchSignup(
  sdk: FacebookSDK | undefined,
  attempt: SignupStart | undefined,
  state: {
    active: Ref<boolean>
    mounted: Ref<boolean>
    currentId: Ref<string | undefined>
    receivedCode: Ref<boolean>
    popupPending: Ref<boolean>
  },
  onCode: (code: string) => void,
  onProgress: (progress: SignupProgress) => void,
  onError: (message: string) => void,
  // The number is already on the WhatsApp Business app and should stay there
  // (Meta coexistence). Off means a fresh Cloud-only number.
  keepBusinessApp = false
) {
  if (!attempt || !sdk || state.active.current) return
  if (Date.parse(attempt.expiresAt) <= Date.now())
    return onError("Setup expired. Prepare a new connection.")
  state.active.current = true
  state.popupPending.current = true
  onError("")
  onProgress({
    attemptId: attempt.attemptId,
    status: "AWAITING_META",
    message: "Complete the WhatsApp setup window.",
  })
  try {
    sdk.login(
      (response) => {
        if (
          !state.mounted.current ||
          state.currentId.current !== attempt.attemptId
        )
          return
        state.popupPending.current = false
        const code = response.authResponse?.code
        if (typeof code !== "string" || !code)
          return onError(
            "Meta did not return authorization. Prepare a new connection to retry."
          )
        state.receivedCode.current = true
        onCode(code)
      },
      {
        config_id: attempt.configurationId,
        response_type: "code",
        override_default_response_type: true,
        extras: keepBusinessApp
          ? {
              setup: {},
              featureType: "whatsapp_business_app_onboarding" as const,
            }
          : { setup: {} },
      }
    )
  } catch {
    state.active.current = false
    state.popupPending.current = false
    onError("Meta could not open. Allow popups and prepare a new connection.")
  }
}
