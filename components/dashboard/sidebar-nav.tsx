"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  getWideNav,
  getWideSecondaryNav,
  isNavActive,
  type NavBadge,
  type NavBadges,
  type NavItem,
} from "./nav-items";
import { cn } from "@/lib/utils";
import type { Vocabulary } from "@/lib/vocabulary";
import type { AuthRole } from "@/lib/api/types";

type SidebarNavProps = {
  badges?: NavBadges;
  vocab: Vocabulary;
  role: AuthRole;
};

/**
 * Desktop sidebar navigation: a top group of the four core surfaces, then
 * labelled groups of secondary destinations. Active rows use a filled pill
 * highlight (no side-stripe), matching the grouped-sidebar reference.
 */
export function SidebarNav({ badges, vocab, role }: SidebarNavProps) {
  const pathname = usePathname();
  const primary = getWideNav(vocab, role);
  const groups = getWideSecondaryNav(role);

  return (
    <nav className="flex flex-col gap-5" aria-label="Primary">
      <div className="flex flex-col gap-1">
        {primary.map((item) => (
          <NavRow
            key={item.href}
            item={item}
            badge={badges?.[item.href]}
            active={isNavActive(pathname, item.href)}
          />
        ))}
      </div>

      {groups.map((group) => (
        <div key={group.label} className="flex flex-col gap-1">
          <p className="text-sidebar-foreground/45 px-3 pb-1 text-[0.7rem] font-semibold tracking-wider uppercase">
            {group.label}
          </p>
          {group.items.map((item) => (
            <NavRow
              key={item.href}
              item={item}
              badge={badges?.[item.href]}
              active={isNavActive(pathname, item.href)}
            />
          ))}
        </div>
      ))}
    </nav>
  );
}

function NavRow({
  item,
  badge,
  active,
}: {
  item: NavItem;
  badge?: NavBadge;
  active: boolean;
}) {
  const Icon = item.icon;
  return (
    <Link
      href={item.href}
      aria-current={active ? "page" : undefined}
      className={cn(
        "group/nav flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium transition-colors",
        "focus-visible:ring-ring focus-visible:ring-2 focus-visible:outline-none",
        active
          ? "bg-sidebar-accent text-sidebar-accent-foreground"
          : "text-sidebar-foreground/75 hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground",
      )}
    >
      <Icon className="size-[1.15rem]" strokeWidth={active ? 2.2 : 1.85} />
      <span className="flex-1 truncate">{item.label}</span>
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
}
