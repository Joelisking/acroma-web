import Link from "next/link";
import { LogoMark } from "@/components/brand/logo-mark";
import { SidebarNav } from "./sidebar-nav";
import { AccountMenu } from "./account-menu";
import type { NavBadges } from "./nav-items";
import type { Vocabulary } from "@/lib/vocabulary";

type SidebarProps = {
  businessName: string;
  email: string;
  badges?: NavBadges;
  vocab: Vocabulary;
};

/**
 * Desktop sidebar — fixed-width, sticky on the left.
 * Brand mark, primary nav, account block at the bottom.
 */
export function Sidebar({ businessName, email, badges, vocab }: SidebarProps) {
  return (
    <aside
      className="bg-sidebar text-sidebar-foreground border-sidebar-border hidden w-64 shrink-0 border-r lg:flex lg:flex-col"
      aria-label="Sidebar"
    >
      <div className="border-sidebar-border/70 flex h-16 items-center border-b px-5">
        <Link href="/dashboard" aria-label="Acroma dashboard">
          <LogoMark className="size-8" />
        </Link>
      </div>

      <div className="flex flex-1 flex-col gap-6 p-4">
        <SidebarNav badges={badges} vocab={vocab} />
      </div>

      <div className="border-sidebar-border/70 border-t p-3">
        <AccountMenu name={businessName} email={email} />
      </div>
    </aside>
  );
}
