import { Logo } from "@/components/brand/logo";
import { ConnectionPill } from "./connection-pill";

type TopBarProps = {
  businessName: string;
  whatsappActive: boolean;
};

/**
 * Top bar shown above content. Compact on mobile (with logo), spacious
 * on desktop (with eyebrow + greeting).
 */
export function TopBar({ businessName, whatsappActive }: TopBarProps) {
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

        <ConnectionPill active={whatsappActive} />
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
