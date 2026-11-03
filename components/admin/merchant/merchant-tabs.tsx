"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn } from "@/lib/utils";

const TABS = [
  { slug: "", label: "Overview" },
  { slug: "/ai", label: "AI decisions" },
  { slug: "/audit", label: "Audit trail" },
  { slug: "/logs", label: "Logs" },
];

export function MerchantTabs({ id }: { id: string }) {
  const pathname = usePathname();
  const root = `/admin/businesses/${id}`;

  return (
    <nav aria-label="Merchant sections" className="flex gap-1 border-b">
      {TABS.map((tab) => {
        const href = `${root}${tab.slug}`;
        const active = pathname === href;
        return (
          <Link
            key={tab.label}
            href={href}
            aria-current={active ? "page" : undefined}
            className={cn(
              "-mb-px border-b-2 px-3 py-2 text-sm transition-colors",
              "focus-visible:ring-2 focus-visible:ring-ring",
              active
                ? "border-brand-orange font-medium text-foreground"
                : "border-transparent text-muted-foreground hover:text-foreground",
            )}
          >
            {tab.label}
          </Link>
        );
      })}
    </nav>
  );
}
