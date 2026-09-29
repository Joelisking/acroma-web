import { SectionNav } from "./section-nav"
import type { AuthRole, BusinessType } from "@/lib/api/types"

export function SettingsSectionsLayout({
  role,
  businessType,
  children,
}: {
  role: AuthRole
  businessType?: BusinessType
  children: React.ReactNode
}) {
  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-[200px_minmax(0,1fr)]">
      <aside className="min-w-0 lg:sticky lg:top-24 lg:self-start">
        <SectionNav role={role} businessType={businessType} />
      </aside>
      <div className="min-w-0 space-y-6">{children}</div>
    </div>
  )
}
