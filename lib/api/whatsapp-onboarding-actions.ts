"use server"
import { revalidatePath } from "next/cache"
import { z } from "zod"
import { apiFetch } from "./server"
import type {
  SignupAction,
  SignupProgress,
  SignupStart,
} from "./whatsapp-onboarding"
import type { SignupSelection } from "../whatsapp/signup-events"
const attemptId = z.string().uuid()
const nonceValue = z.string().min(32).max(128)
async function safe<T>(operation: () => Promise<T>): Promise<SignupAction<T>> {
  try {
    return { ok: true, data: await operation() }
  } catch {
    return {
      ok: false,
      error:
        "Could not complete WhatsApp setup. Check your connection and sign in again if needed.",
    }
  }
}
export async function startWhatsappSignup(): Promise<
  SignupAction<SignupStart>
> {
  return safe(() =>
    apiFetch<SignupStart>("/whatsapp-onboarding/attempts", { method: "POST" })
  )
}
export async function sendSignupCode(
  id: string,
  nonce: string,
  code: string
): Promise<SignupAction<SignupProgress>> {
  return safe(() =>
    apiFetch<SignupProgress>(
      `/whatsapp-onboarding/attempts/${attemptId.parse(id)}/code`,
      {
        method: "POST",
        body: {
          nonce: nonceValue.parse(nonce),
          code: z.string().min(1).max(8192).parse(code),
        },
      }
    )
  )
}
export async function sendSignupSelection(
  id: string,
  nonce: string,
  selection: SignupSelection
): Promise<SignupAction<SignupProgress>> {
  return safe(() =>
    apiFetch<SignupProgress>(
      `/whatsapp-onboarding/attempts/${attemptId.parse(id)}/selection`,
      { method: "POST", body: { nonce: nonceValue.parse(nonce), selection } }
    )
  )
}
export async function resumeWhatsappSignup(
  id: string,
  nonce: string,
  pin?: string
): Promise<SignupAction<SignupProgress>> {
  const result = await safe(() =>
    apiFetch<SignupProgress>(
      `/whatsapp-onboarding/attempts/${attemptId.parse(id)}/resume`,
      {
        method: "POST",
        body: {
          nonce: nonceValue.parse(nonce),
          ...(pin
            ? {
                pin: z
                  .string()
                  .regex(/^\d{6}$/)
                  .parse(pin),
              }
            : {}),
        },
      }
    )
  )
  if (result.ok && result.data.status === "CONNECTED")
    revalidatePath("/dashboard/settings/whatsapp")
  return result
}
export async function getSignupProgress(
  id: string
): Promise<SignupAction<SignupProgress>> {
  return safe(() =>
    apiFetch<SignupProgress>(
      `/whatsapp-onboarding/attempts/${attemptId.parse(id)}`
    )
  )
}

export async function cancelWhatsappSignup(
  id: string,
  nonce: string
): Promise<SignupAction<SignupProgress>> {
  return safe(() =>
    apiFetch<SignupProgress>(
      `/whatsapp-onboarding/attempts/${attemptId.parse(id)}/cancel`,
      {
        method: "POST",
        body: { nonce: nonceValue.parse(nonce) },
      }
    )
  )
}
