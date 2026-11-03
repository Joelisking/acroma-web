/**
 * Confirm marker shared by the client confirm dialog and the server-side
 * `apiFetch`. Client-safe: no server-only imports.
 *
 * While a super admin is logged in as a merchant, the backend answers 428 to
 * every non-GET request that lacks `x-acroma-confirmed: 1`. The dialog sets a
 * short-lived cookie on confirm; `apiFetch` sees it on the Server Action /
 * route handler request and adds the header. This guards against mistakes
 * (a screen the dialog doesn't cover yet fails loudly instead of changing
 * data). It is not a security boundary.
 */
export const CONFIRM_COOKIE = "acroma_confirm"
export const CONFIRM_HEADER = "x-acroma-confirmed"

/** How long the marker lives if the `finally` clear never runs (seconds). */
const CONFIRM_MAX_AGE = 30

export type ConfirmSpec = {
  /** Short imperative label, e.g. "Save item changes". */
  title: string
  /** Extra detail shown under the merchant line. */
  description?: string
  /** `high` makes the admin type the merchant's name before confirming. */
  risk?: "normal" | "high"
  /** Confirm button text. Defaults to "Confirm". */
  confirmLabel?: string
}

export function setConfirmCookie(): void {
  if (typeof document === "undefined") return
  document.cookie = `${CONFIRM_COOKIE}=1; Max-Age=${CONFIRM_MAX_AGE}; Path=/; SameSite=Lax`
}

export function clearConfirmCookie(): void {
  if (typeof document === "undefined") return
  document.cookie = `${CONFIRM_COOKIE}=; Max-Age=0; Path=/; SameSite=Lax`
}
