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
  Calculator,
  type LucideIcon,
} from "lucide-react";
import type { Vocabulary } from "@/lib/vocabulary";
import type { AuthRole } from "@/lib/api/types";

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
 * The two destinations a worker can reach. Everything else is owner ground,
 * and the API answers 403 there, so listing it would only be a dead end.
 */
// The till and today's orders. Today is an owner surface: it carries revenue,
// conversation counts and the WhatsApp/payout setup callouts, none of which a
// worker can act on or should see. Staff home is the till, because ringing up
// the person in front of them is the job; Orders is the second tab for
// checking what is already paid or ready.
const STAFF_HREFS = ["/dashboard/till", "/dashboard/orders"];

/**
 * The four surfaces a merchant lives in during the day. These are the mobile
 * bottom-tab destinations. Labels swap per vertical (Orders↔Bookings,
 * Catalog↔Menu); routes never change. A worker sees Today and Orders only.
 */
export function getPrimaryNav(vocab: Vocabulary, role: AuthRole): NavItem[] {
  const items: NavItem[] = [
    { href: "/dashboard", label: "Today", icon: Home },
    { href: "/dashboard/till", label: "Till", icon: Calculator },
    { href: "/dashboard/orders", label: vocab.orders, icon: ShoppingBag },
    { href: "/dashboard/conversations", label: "Chats", icon: MessageCircle },
    { href: "/dashboard/catalog", label: vocab.catalog, icon: Package },
  ];
  if (role === "STAFF") {
    // Till first: a worker's home is the screen they ring up on.
    const byHref = new Map(items.map((i) => [i.href, i]));
    return STAFF_HREFS.map((href) => byHref.get(href)).filter(
      (i): i is NavItem => i !== undefined,
    );
  }
  return items;
}

/**
 * The main nav for surfaces with room for it — the desktop sidebar's top group
 * and the tablet rail. Promotes Analytics alongside the four core surfaces.
 * The mobile bottom bar stays at four (see getPrimaryNav); Analytics lives in
 * its "More" drawer instead. Analytics is owner ground, so a worker's wide nav
 * is the same two entries as the primary one.
 */
export function getWideNav(vocab: Vocabulary, role: AuthRole): NavItem[] {
  const primary = getPrimaryNav(vocab, role);
  return role === "STAFF" ? primary : [...primary, ANALYTICS_NAV];
}

/** Hrefs promoted into the wide/main nav, so wider surfaces don't list them twice. */
const WIDE_PROMOTED_HREFS = new Set<string>([ANALYTICS_NAV.href]);

/**
 * Secondary destinations, grouped. The full set (including Measure/Analytics)
 * backs the mobile "More" drawer, so the bottom bar stays at four core tabs.
 * Every one of these is owner ground, so a worker gets no groups at all and
 * the "More" drawer falls back to the account block and sign-out.
 */
export function getSecondaryNav(role: AuthRole): NavGroup[] {
  if (role === "STAFF") return [];
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
export function getWideSecondaryNav(role: AuthRole): NavGroup[] {
  return getSecondaryNav(role)
    .map((group) => ({
      ...group,
      items: group.items.filter((i) => !WIDE_PROMOTED_HREFS.has(i.href)),
    }))
    .filter((group) => group.items.length > 0);
}

/** Routes that count as "secondary" on mobile, used to light the More tab. */
export function isSecondaryRoute(pathname: string, role: AuthRole): boolean {
  return routeInGroups(getSecondaryNav(role), pathname);
}

/** Routes behind "More" on wide surfaces (excludes items promoted to the rail). */
export function isWideSecondaryRoute(pathname: string, role: AuthRole): boolean {
  return routeInGroups(getWideSecondaryNav(role), pathname);
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
