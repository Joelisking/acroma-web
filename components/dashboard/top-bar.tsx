import { Logo } from "@/components/brand/logo";
import { ConnectionPill } from "./connection-pill";

type TopBarProps = {
  businessName: string;
  whatsappActive: boolean;
};

/**
 * Sticky bar above content. Mobile shows the wordmark; desktop shows a quiet
 * greeting block. The tablet rail carries its own mark, so the mobile logo
 * hides at md. The connection pill sits right on every breakpoint.
 */
export function TopBar({ businessName, whatsappActive }: TopBarProps) {
  return (
    <header className="border-border bg-paper/85 sticky top-0 z-30 border-b backdrop-blur-md">
      <div className="flex items-center justify-between px-4 py-3 sm:px-6 lg:py-4">
        <div className="flex items-center gap-3 md:hidden">
          <Logo />
        </div>
        <div className="hidden lg:block">
          <p className="text-muted-foreground text-xs font-medium">{greet()}</p>
          <h1 className="text-foreground mt-0.5 text-lg font-bold tracking-tight">
            {businessName}
          </h1>
        </div>

        <div className="ml-auto flex items-center gap-2">
          <ConnectionPill active={whatsappActive} />
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
