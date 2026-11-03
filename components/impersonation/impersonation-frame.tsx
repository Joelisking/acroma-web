import { readImpersonation } from "@/lib/api/impersonation"

import { ConfirmProvider } from "./confirm-provider"
import { ImpersonationBanner } from "./impersonation-banner"
import { ImpersonationProvider } from "./impersonation-provider"

type Props = {
  children: React.ReactNode
}

/**
 * Banner + provider for merchant-area routes outside the dashboard shell
 * (onboarding, WhatsApp connect), so an admin acting as a merchant always
 * sees who they are acting as and can Exit. Renders children unchanged when
 * nobody is impersonating.
 */
export async function ImpersonationFrame({ children }: Props) {
  const impersonation = await readImpersonation()
  return (
    <ImpersonationProvider value={impersonation}>
      {impersonation && <ImpersonationBanner impersonation={impersonation} />}
      <ConfirmProvider>{children}</ConfirmProvider>
    </ImpersonationProvider>
  )
}
