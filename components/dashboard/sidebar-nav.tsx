"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { navItems, type NavBadges } from "./nav-items";
import { cn } from "@/lib/utils";

type SidebarNavProps = {
  badges?: NavBadges;
};

/**
 * Vertical navigation list used inside the desktop sidebar.
 * Highlights the active route and renders an unread/urgent badge per item.
 */
export function SidebarNav({ badges }: SidebarNavProps) {
  const pathname = usePathname();

  return (
    <nav className="flex flex-col gap-1" aria-label="Primary">
      {navItems.map((item) => {
        const active =
          pathname === item.href ||
          (item.href !== "/dashboard" && pathname.startsWith(item.href));
        const Icon = item.icon;
        const badge = badges?.[item.href];
        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={active ? "page" : undefined}
            className={cn(
              "group/nav relative flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
              "focus-visible:ring-ring focus-visible:ring-2 focus-visible:outline-none",
              active
                ? "bg-sidebar-accent text-sidebar-accent-foreground"
                : "text-sidebar-foreground/75 hover:bg-sidebar-accent/60 hover:text-sidebar-accent-foreground",
            )}
          >
            <span
              aria-hidden
              className={cn(
                "absolute top-1/2 left-0 h-5 w-0.5 -translate-y-1/2 rounded-full bg-brand-orange transition-opacity",
                active ? "opacity-100" : "opacity-0",
              )}
            />
            <Icon className="size-4" strokeWidth={1.75} />
            <span className="flex-1">{item.label}</span>
            {badge && badge.count > 0 ? (
              <span
                aria-label={
                  badge.tone === "waiting"
                    ? `${badge.count} conversations waiting on you`
                    : `${badge.count} unread`
                }
                className={cn(
                  "inline-flex h-5 min-w-5 items-center justify-center rounded-full px-1.5 text-[0.65rem] font-semibold tabular-nums",
                  badge.tone === "waiting"
                    ? "bg-brand-orange text-primary-foreground"
                    : "bg-secondary text-secondary-foreground",
                )}
              >
                {badge.count > 99 ? "99+" : badge.count}
              </span>
            ) : null}
          </Link>
        );
      })}
    </nav>
  );
}
