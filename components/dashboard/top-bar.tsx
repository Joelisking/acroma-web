import { Logo } from "@/components/brand/logo";
import { ConnectionPill } from "./connection-pill";
import { AccountMenuButton } from "./account-menu-button";

type TopBarProps = {
  businessName: string;
  email: string;
  whatsappActive: boolean;
};

/**
 * Top bar shown above content. Compact on mobile (with logo), spacious
 * on desktop (with eyebrow + greeting).
 */
export function TopBar({ businessName, email, whatsappActive }: TopBarProps) {
  const greeting = greet();
  return (
    <header className="border-border/70 bg-background/85 sticky top-0 z-30 border-b backdrop-blur-md">
      <div className="flex items-center justify-between px-4 py-3 sm:px-6 lg:py-5">
        {/* Mobile: logo. Desktop: greeting block. */}
        <div className="flex items-center gap-3 lg:hidden">
          <Logo />
        </div>
        <div className="hidden lg:block">
          <p className="eyebrow text-muted-foreground">{greeting}</p>
          <h1 className="font-display text-foreground mt-1 text-2xl font-medium tracking-tight">
            {businessName}
          </h1>
        </div>

        <div className="flex items-center gap-2">
          <ConnectionPill active={whatsappActive} />
          {/* Mobile-only: the desktop sidebar already carries the account
              block (and its sign-out), so this hides at lg. */}
          <AccountMenuButton
            name={businessName}
            email={email}
            className="lg:hidden"
          />
        </div>
      </div>
    </header>
  );
}

function greet() {
  const h = new Date().getHours();
  if (h < 5) return "Late night";
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  if (h < 21) return "Good evening";
  return "Good night";
}
