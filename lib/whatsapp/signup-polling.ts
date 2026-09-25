import type { SignupAction, SignupProgress } from "../api/whatsapp-onboarding"
type Result = SignupAction<SignupProgress>
export const signupStopped = (status: string) =>
  ["CONNECTED", "ACTION_REQUIRED", "FAILED", "CANCELLED", "EXPIRED"].includes(
    status
  )
export function startSignupPolling(options: {
  read: () => Promise<Result>
  resume: () => Promise<Result>
  apply: (result: Result) => void
  schedule: (task: () => void, delay: number) => number
  cancel: (timer: number) => void
}) {
  let stopped = false
  let timer = 0
  let failures = 0
  const tick = async () => {
    let result: Result
    try {
      // Always read first, including after an uncertain mutation response.
      result = await options.read()
      if (stopped) return
      if (result.ok && result.data.status === "VALIDATING")
        result = await options.resume()
    } catch {
      result = {
        ok: false,
        error: "Connection interrupted. Retrying setup status…",
      }
    }
    if (stopped) return
    options.apply(result)
    if (result.ok && signupStopped(result.data.status)) return
    failures = result.ok ? 0 : Math.min(failures + 1, 4)
    timer = options.schedule(
      () => void tick(),
      Math.min(1500 * 2 ** failures, 15000)
    )
  }
  timer = options.schedule(() => void tick(), 1500)
  return () => {
    stopped = true
    options.cancel(timer)
  }
}
