import Link from "next/link";
import { Logo } from "@/components/brand/logo";
import { SidebarNav } from "./sidebar-nav";
import { AccountMenu } from "./account-menu";
import type { NavBadges } from "./nav-items";

type SidebarProps = {
  businessName: string;
  email: string;
  badges?: NavBadges;
};

/**
 * Desktop sidebar — fixed-width, sticky on the left.
 * Brand mark, primary nav, account block at the bottom.
 */
export function Sidebar({ businessName, email, badges }: SidebarProps) {
  return (
    <aside
      className="bg-sidebar text-sidebar-foreground border-sidebar-border hidden w-64 shrink-0 border-r lg:flex lg:flex-col"
      aria-label="Sidebar"
    >
      <div className="border-sidebar-border/70 flex h-16 items-center border-b px-5">
        <Link href="/dashboard" aria-label="Acroma dashboard">
          <Logo />
        </Link>
      </div>

      <div className="flex flex-1 flex-col gap-6 p-4">
        <SidebarNav badges={badges} />
      </div>

      <div className="border-sidebar-border/70 border-t p-3">
        <AccountMenu name={businessName} email={email} />
      </div>
    </aside>
  );
}
