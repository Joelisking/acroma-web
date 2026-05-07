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
