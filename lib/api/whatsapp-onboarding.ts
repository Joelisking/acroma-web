export type SignupStatus =
  | "AWAITING_META"
  | "EXCHANGING"
  | "AWAITING_SELECTION"
  | "VALIDATING"
  | "SUBSCRIBING"
  | "REGISTERING"
  | "CONNECTED"
  | "ACTION_REQUIRED"
  | "FAILED"
  | "CANCELLED"
  | "EXPIRED"
export type SignupStart = {
  attemptId: string
  nonce: string
  expiresAt: string
  appId: string
  configurationId: string
  graphVersion: string
}
export type SignupProgress = {
  attemptId: string
  status: SignupStatus
  message: string
  needsPin?: boolean
}
export type SignupAvailability = {
  enabled: boolean
  hasExistingSender: boolean
}
export type SignupAction<T> =
  | { ok: true; data: T }
  | { ok: false; error: string }
