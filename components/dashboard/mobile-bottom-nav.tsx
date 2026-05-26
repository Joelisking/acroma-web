"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { navItems, type NavBadges } from "./nav-items";
import { cn } from "@/lib/utils";

type MobileBottomNavProps = {
  badges?: NavBadges;
};

/**
 * Bottom navigation for mobile. Five items, labels under icons.
 * Sticky to the safe-area bottom; lifted card surface above body content.
 */
export function MobileBottomNav({ badges }: MobileBottomNavProps) {
  const pathname = usePathname();

  return (
    <nav
      className={cn(
        "lg:hidden",
        "border-border/70 bg-background/85 fixed inset-x-0 bottom-0 z-40 border-t backdrop-blur-md",
        "[padding-bottom:calc(env(safe-area-inset-bottom)+0.75rem)]",
      )}
      aria-label="Primary"
    >
      <ul className="grid grid-cols-5">
        {navItems.map((item) => {
          const active =
            pathname === item.href ||
            (item.href !== "/dashboard" && pathname.startsWith(item.href));
          const Icon = item.icon;
          const badge = badges?.[item.href];
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "relative flex h-16 flex-col items-center justify-center gap-1 text-[0.7rem] font-medium transition-colors",
                  active
                    ? "text-brand-orange"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                <span className="relative">
                  <Icon
                    className="size-5"
                    strokeWidth={active ? 2 : 1.75}
                  />
                  {badge && badge.count > 0 ? (
                    <span
                      aria-label={
                        badge.tone === "waiting"
                          ? `${badge.count} conversations waiting on you`
                          : `${badge.count} unread`
                      }
                      className={cn(
                        "absolute -top-1 -right-2 inline-flex h-4 min-w-4 items-center justify-center rounded-full px-1 text-[0.6rem] font-semibold tabular-nums",
                        badge.tone === "waiting"
                          ? "bg-brand-orange text-primary-foreground"
                          : "bg-secondary text-secondary-foreground",
                      )}
                    >
                      {badge.count > 9 ? "9+" : badge.count}
                    </span>
                  ) : null}
                </span>
                <span>{item.label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
