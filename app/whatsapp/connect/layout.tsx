import { ImpersonationFrame } from "@/components/impersonation/impersonation-frame"

/** Shows the "Log in as" banner and Exit here too; otherwise a pass-through. */
export default function WhatsappConnectLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <ImpersonationFrame>{children}</ImpersonationFrame>
}
