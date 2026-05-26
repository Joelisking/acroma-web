"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  MessageCircle,
  Building2,
  Clock,
  CreditCard,
  Sparkles,
  BookOpen,
  Bell,
  ShieldCheck,
  AlarmClock,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";

type Section = {
  href: string;
  label: string;
  icon: LucideIcon;
};

export const SETTINGS_SECTIONS: Section[] = [
  { href: "/dashboard/settings/whatsapp", label: "WhatsApp", icon: MessageCircle },
  { href: "/dashboard/settings/business", label: "Business", icon: Building2 },
  { href: "/dashboard/settings/opening-hours", label: "Hours", icon: Clock },
  { href: "/dashboard/settings/payments", label: "Payments", icon: CreditCard },
  { href: "/dashboard/settings/ai", label: "AI", icon: Sparkles },
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
    href: "/dashboard/settings/security",
    label: "Security",
    icon: ShieldCheck,
  },
];

export function SectionNav() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Settings sections"
      className="flex gap-1 overflow-x-auto rounded-full border-border/70 border bg-card p-1 lg:flex-col lg:rounded-2xl lg:bg-transparent lg:border-0 lg:p-0"
    >
      {SETTINGS_SECTIONS.map((s) => {
        const active = pathname === s.href || pathname.startsWith(s.href + "/");
        const Icon = s.icon;
        return (
          <Link
            key={s.href}
            href={s.href}
            aria-current={active ? "page" : undefined}
            className={cn(
              "inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-medium whitespace-nowrap transition-colors",
              "lg:rounded-lg lg:text-sm lg:px-3 lg:py-2",
              active
                ? "bg-brand-orange text-primary-foreground lg:bg-sidebar-accent lg:text-sidebar-accent-foreground"
                : "text-muted-foreground hover:text-foreground lg:hover:bg-sidebar-accent/60",
            )}
          >
            <Icon className="size-4" strokeWidth={1.75} />
            <span>{s.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
