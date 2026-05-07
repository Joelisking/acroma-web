"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { navItems } from "./nav-items";
import { cn } from "@/lib/utils";

type MobileBottomNavProps = {
  badges?: Partial<Record<string, number>>;
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
        "[padding-bottom:env(safe-area-inset-bottom)]",
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
                  {badge && badge > 0 ? (
                    <span
                      aria-label={`${badge} waiting`}
                      className="bg-brand-orange text-primary-foreground absolute -top-1 -right-2 inline-flex h-4 min-w-4 items-center justify-center rounded-full px-1 text-[0.6rem] font-semibold tabular-nums"
                    >
                      {badge > 9 ? "9+" : badge}
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
