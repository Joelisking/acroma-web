"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { Button } from "@/components/ui/button";
import { logoutAction } from "@/lib/admin/auth-actions";
import { cn } from "@/lib/utils";

const LINKS = [
  { href: "/admin", label: "Merchants" },
  { href: "/admin/errors", label: "Errors" },
  { href: "/admin/activity", label: "Activity" },
  { href: "/admin/usage", label: "Usage" },
];

function isActive(pathname: string, href: string) {
  if (href === "/admin") {
    return pathname === "/admin" || pathname.startsWith("/admin/businesses");
  }
  return pathname.startsWith(href);
}

export function AdminNav() {
  const pathname = usePathname();

  return (
    <header className="border-b bg-card">
      <nav
        aria-label="Admin"
        className="mx-auto flex max-w-6xl flex-wrap items-center gap-1 px-4 py-2 sm:px-6 lg:px-10"
      >
        <span className="mr-4 font-heading font-medium text-brand-orange">
          Acroma admin
        </span>
        {LINKS.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            aria-current={isActive(pathname, link.href) ? "page" : undefined}
            className={cn(
              "rounded-md px-3 py-1.5 text-sm text-muted-foreground transition-colors",
              "hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring",
              isActive(pathname, link.href) && "bg-accent font-medium text-foreground",
            )}
          >
            {link.label}
          </Link>
        ))}
        <form action={logoutAction} className="ml-auto">
          <Button type="submit" variant="ghost" size="sm">
            Sign out
          </Button>
        </form>
      </nav>
    </header>
  );
}
