import { LogoMark } from "@/components/brand/logo-mark";
import { ConnectionPill } from "./connection-pill";

type TopBarProps = {
  whatsappActive: boolean;
};

/**
 * Slim sticky bar above content. Mobile shows the wordmark (the tablet rail and
 * desktop sidebar carry their own mark, so it hides at md). Each page supplies
 * its own heading, so the bar stays out of the way: just the connection pill,
 * right-aligned on every breakpoint.
 */
export function TopBar({ whatsappActive }: TopBarProps) {
  return (
    <header className="border-border bg-paper/85 sticky top-0 z-30 border-b backdrop-blur-md">
      <div className="flex items-center justify-between px-4 py-3 sm:px-6 lg:py-4">
        <div className="flex items-center gap-3 md:hidden">
          <LogoMark className="size-7" />
        </div>
        <div className="ml-auto flex items-center gap-2">
          <ConnectionPill active={whatsappActive} />
        </div>
      </div>
    </header>
  );
}
