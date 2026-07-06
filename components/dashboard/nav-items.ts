import {
  Home,
  MessageCircle,
  ShoppingBag,
  Package,
  Users,
  Megaphone,
  Ticket,
  Wallet,
  Settings,
  BarChart3,
  type LucideIcon,
} from "lucide-react";
import type { Vocabulary } from "@/lib/vocabulary";

export type NavItem = {
  href: string;
  label: string;
  icon: LucideIcon;
};

export type NavGroup = {
  label: string;
  items: NavItem[];
};

/**
 * Badge shape passed from the dashboard layout to nav components.
 * `tone` lets the chat tab signal "you still owe a reply" (waiting, urgent)
 * separately from "new unopened messages" (unread).
 */
export type NavBadge = {
  count: number;
  tone: "waiting" | "unread";
};

export type NavBadges = Partial<Record<string, NavBadge>>;

const ANALYTICS_NAV: NavItem = {
  href: "/dashboard/analytics",
  label: "Analytics",
  icon: BarChart3,
};

/**
 * The four surfaces a merchant lives in during the day. These are the mobile
 * bottom-tab destinations. Labels swap per vertical (Orders↔Bookings,
 * Catalog↔Menu); routes never change.
 */
export function getPrimaryNav(vocab: Vocabulary): NavItem[] {
  return [
    { href: "/dashboard", label: "Today", icon: Home },
    { href: "/dashboard/orders", label: vocab.orders, icon: ShoppingBag },
    { href: "/dashboard/conversations", label: "Chats", icon: MessageCircle },
    { href: "/dashboard/catalog", label: vocab.catalog, icon: Package },
  ];
}

/**
 * The main nav for surfaces with room for it — the desktop sidebar's top group
 * and the tablet rail. Promotes Analytics alongside the four core surfaces.
 * The mobile bottom bar stays at four (see getPrimaryNav); Analytics lives in
 * its "More" drawer instead.
 */
export function getWideNav(vocab: Vocabulary): NavItem[] {
  return [...getPrimaryNav(vocab), ANALYTICS_NAV];
}

/** Hrefs promoted into the wide/main nav, so wider surfaces don't list them twice. */
const WIDE_PROMOTED_HREFS = new Set<string>([ANALYTICS_NAV.href]);

/**
 * Secondary destinations, grouped. The full set (including Measure/Analytics)
 * backs the mobile "More" drawer, so the bottom bar stays at four core tabs.
 */
export function getSecondaryNav(): NavGroup[] {
  return [
    {
      label: "Grow",
      items: [
        { href: "/dashboard/customers", label: "Customers", icon: Users },
        { href: "/dashboard/broadcasts", label: "Broadcasts", icon: Megaphone },
        { href: "/dashboard/discounts", label: "Discounts", icon: Ticket },
      ],
    },
    {
      label: "Measure",
      items: [ANALYTICS_NAV],
    },
    {
      label: "Account",
      items: [
        { href: "/dashboard/settings/payments", label: "Payments", icon: Wallet },
        { href: "/dashboard/settings", label: "Settings", icon: Settings },
      ],
    },
  ];
}

/**
 * Secondary nav for wide surfaces (desktop sidebar, tablet rail), with the
 * items already promoted into the main nav removed so they don't appear twice.
 * Empty groups are dropped.
 */
export function getWideSecondaryNav(): NavGroup[] {
  return getSecondaryNav()
    .map((group) => ({
      ...group,
      items: group.items.filter((i) => !WIDE_PROMOTED_HREFS.has(i.href)),
    }))
    .filter((group) => group.items.length > 0);
}

/** Routes that count as "secondary" on mobile, used to light the More tab. */
export function isSecondaryRoute(pathname: string): boolean {
  return routeInGroups(getSecondaryNav(), pathname);
}

/** Routes behind "More" on wide surfaces (excludes items promoted to the rail). */
export function isWideSecondaryRoute(pathname: string): boolean {
  return routeInGroups(getWideSecondaryNav(), pathname);
}

function routeInGroups(groups: NavGroup[], pathname: string): boolean {
  return groups
    .flatMap((g) => g.items)
    .some((i) => pathname === i.href || pathname.startsWith(`${i.href}/`));
}

/** Active-state test that ignores the index route's prefix-match trap. */
export function isNavActive(pathname: string, href: string): boolean {
  if (href === "/dashboard") return pathname === "/dashboard";
  return pathname === href || pathname.startsWith(`${href}/`);
}
