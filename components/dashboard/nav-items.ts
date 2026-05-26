import {
  LayoutDashboard,
  MessageSquare,
  ShoppingBag,
  Package,
  Settings,
  type LucideIcon,
} from "lucide-react";

export type NavItem = {
  href: string;
  label: string;
  icon: LucideIcon;
};

/**
 * Badge shape passed from the dashboard layout to nav components.
 * `tone` lets the chat tab signal "you still owe a reply" (waiting, urgent)
 * separately from "new unopened messages" (unread). Visually:
 *   - waiting → solid brand-orange (matches escalation language)
 *   - unread  → muted secondary fill, smaller visual weight
 */
export type NavBadge = {
  count: number;
  tone: "waiting" | "unread";
};

export type NavBadges = Partial<Record<string, NavBadge>>;

/**
 * Single source of truth for primary dashboard navigation.
 * Used by the desktop sidebar and the mobile bottom nav.
 * Keep at 5 items max for bottom-nav-limit.
 */
export const navItems: NavItem[] = [
  { href: "/dashboard", label: "Overview", icon: LayoutDashboard },
  { href: "/dashboard/conversations", label: "Chats", icon: MessageSquare },
  { href: "/dashboard/orders", label: "Orders", icon: ShoppingBag },
  { href: "/dashboard/catalog", label: "Catalog", icon: Package },
  { href: "/dashboard/settings", label: "Settings", icon: Settings },
];
