// Meta's finish event for a number that stays on the WhatsApp Business app
// (coexistence). It carries the WABA only; the backend looks up the phone.
export const COEXISTENCE_FINISH = "FINISH_WHATSAPP_BUSINESS_APP_ONBOARDING"
export type SignupSelection =
  | {
      event: "FINISH"
      wabaId: string
      phoneNumberId: string
      businessPortfolioId?: string
    }
  | {
      event: typeof COEXISTENCE_FINISH
      wabaId: string
      businessPortfolioId?: string
    }
export type SignupEvent =
  | { kind: "selection"; selection: SignupSelection }
  | { kind: "cancel" | "unsupported" | "error" }
const origins = new Set([
  "https://www.facebook.com",
  "https://web.facebook.com",
  "https://business.facebook.com",
])
const record = (value: unknown): Record<string, unknown> | null =>
  value !== null && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : null
const identifier = (value: unknown): value is string =>
  typeof value === "string" && /^\d{1,40}$/.test(value)
export function parseSignupEvent(input: {
  origin: string
  data: unknown
}): SignupEvent | null {
  if (!origins.has(input.origin)) return null
  let data: unknown = input.data
  if (typeof data === "string") {
    if (data.length > 16384) return null
    try {
      data = JSON.parse(data) as unknown
    } catch {
      return null
    }
  }
  const message = record(data)
  if (message?.type !== "WA_EMBEDDED_SIGNUP") return null
  if (message.event === "CANCEL") return { kind: "cancel" }
  if (message.event === "ERROR") return { kind: "error" }
  const selection = record(message.data)
  if (message.event === COEXISTENCE_FINISH) {
    if (!selection || !identifier(selection.waba_id)) return null
    return {
      kind: "selection",
      selection: {
        event: COEXISTENCE_FINISH,
        wabaId: selection.waba_id,
        ...(identifier(selection.business_id)
          ? { businessPortfolioId: selection.business_id }
          : {}),
      },
    }
  }
  if (
    typeof message.event === "string" &&
    message.event.startsWith("FINISH") &&
    message.event !== "FINISH"
  )
    return { kind: "unsupported" }
  if (
    message.event !== "FINISH" ||
    !selection ||
    !identifier(selection.waba_id) ||
    !identifier(selection.phone_number_id)
  )
    return null
  return {
    kind: "selection",
    selection: {
      event: "FINISH",
      wabaId: selection.waba_id,
      phoneNumberId: selection.phone_number_id,
      ...(identifier(selection.business_id)
        ? { businessPortfolioId: selection.business_id }
        : {}),
    },
  }
}
