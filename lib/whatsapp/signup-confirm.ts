import type { ConfirmSpec } from "@/lib/impersonation-confirm"

/**
 * Confirm wording for the WhatsApp connect flow while an Acroma admin is
 * logged in as the merchant. Every step that changes the connection is
 * high risk.
 */
export const SIGNUP_CONFIRM = {
  prepare: {
    title: "Start connecting a WhatsApp number",
    description: "Cancels any unfinished connection attempt first.",
    risk: "high",
    confirmLabel: "Start WhatsApp connection",
  },
  code: {
    title: "Send Meta's authorization to connect WhatsApp",
    risk: "high",
    confirmLabel: "Connect WhatsApp",
  },
  selection: {
    title: "Choose the WhatsApp number to connect",
    risk: "high",
    confirmLabel: "Use this WhatsApp number",
  },
  pin: {
    title: "Finish connecting WhatsApp with a registration PIN",
    risk: "high",
    confirmLabel: "Finish connecting WhatsApp",
  },
  resume: {
    title: "Resume the WhatsApp connection",
    risk: "high",
    confirmLabel: "Resume connection",
  },
} satisfies Record<string, ConfirmSpec>
