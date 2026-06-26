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

/**
 * The four surfaces a merchant lives in during the day. These are the mobile
 * bottom-tab destinations and the top group of the desktop sidebar. Labels
 * swap per vertical (Orders↔Bookings, Catalog↔Menu); routes never change.
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
 * Secondary destinations, grouped. On desktop these render as labelled groups
 * under the primary nav; on mobile they live in the "More" drawer behind the
 * profile tab, so the bottom bar stays at four core tabs plus the avatar.
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
      label: "Account",
      items: [
        { href: "/dashboard/settings/payments", label: "Payments", icon: Wallet },
        { href: "/dashboard/settings", label: "Settings", icon: Settings },
      ],
    },
  ];
}

/** Routes that count as "secondary", used to light the mobile More tab. */
export function isSecondaryRoute(pathname: string): boolean {
  return getSecondaryNav()
    .flatMap((g) => g.items)
    .some(
      (i) => pathname === i.href || pathname.startsWith(`${i.href}/`),
    );
}

/** Active-state test that ignores the index route's prefix-match trap. */
export function isNavActive(pathname: string, href: string): boolean {
  if (href === "/dashboard") return pathname === "/dashboard";
  return pathname === href || pathname.startsWith(`${href}/`);
}
