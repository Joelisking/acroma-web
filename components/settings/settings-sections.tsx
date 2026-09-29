import type { ComponentType } from "react"
import {
  MessageCircle,
  Building2,
  Clock,
  CreditCard,
  BookOpen,
  Bell,
  ShieldCheck,
  AlarmClock,
  UsersRound,
} from "lucide-react"
import { LogoMark } from "@/components/brand/logo-mark"
import type { AuthRole, BusinessType } from "@/lib/api/types"

type IconProps = { className?: string; strokeWidth?: number }

/** The Acroma mark, inheriting the nav item's text colour. */
function AiMark({ className }: IconProps) {
  return <LogoMark tone="current" className={className} />
}

type Section = {
  href: string
  label: string
  icon: ComponentType<IconProps>
  /** Hidden from workers. Owners and admins both see it. */
  ownerOnly?: boolean
}

export const SETTINGS_SECTIONS: Section[] = [
  {
    href: "/dashboard/settings/whatsapp",
    label: "WhatsApp",
    icon: MessageCircle,
  },
  { href: "/dashboard/settings/business", label: "Business", icon: Building2 },
  { href: "/dashboard/settings/opening-hours", label: "Hours", icon: Clock },
  { href: "/dashboard/settings/payments", label: "Payments", icon: CreditCard },
  { href: "/dashboard/settings/ai", label: "AI", icon: AiMark },
  {
    href: "/dashboard/settings/knowledge-base",
    label: "Knowledge",
    icon: BookOpen,
  },
  {
    href: "/dashboard/settings/notifications",
    label: "Notifications",
    icon: Bell,
  },
  {
    href: "/dashboard/settings/reminders",
    label: "Reminders",
    icon: AlarmClock,
  },
  {
    href: "/dashboard/settings/team",
    label: "Team",
    icon: UsersRound,
    ownerOnly: true,
  },
  {
    href: "/dashboard/settings/security",
    label: "Security",
    icon: ShieldCheck,
  },
]

/** The sections this role has any use for. */
export function settingsSectionsFor(
  role: AuthRole,
  businessType?: BusinessType
): Section[] {
  return SETTINGS_SECTIONS.filter((s) => !s.ownerOnly || role !== "STAFF").map(
    (s) =>
      businessType === "REAL_ESTATE" &&
      s.href === "/dashboard/settings/opening-hours"
        ? {
            ...s,
            href: "/dashboard/appointments/settings",
            label: "Appointment settings",
          }
        : s
  )
}
