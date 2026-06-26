import Link from "next/link";
import { Logo } from "@/components/brand/logo";

type AuthShellProps = {
  children: React.ReactNode;
  /** Small label above the supporting copy. */
  eyebrow: string;
  headline: React.ReactNode;
  body: string;
  footer?: React.ReactNode;
};

/**
 * Auth layout.
 * Desktop (lg+): two panes — a navy editorial panel with the brand copy on the
 * left, the form on the right.
 * Mobile: a single calm card on the warm paper canvas — brand mark, the same
 * copy, the form, and an optional footer link.
 */
export function AuthShell({
  children,
  eyebrow,
  headline,
  body,
  footer,
}: AuthShellProps) {
  return (
    <div className="bg-paper grid min-h-svh lg:grid-cols-[minmax(0,1.05fr)_minmax(0,1fr)]">
      {/* Desktop editorial panel */}
      <aside className="bg-secondary text-secondary-foreground relative hidden overflow-hidden lg:block">
        <div
          aria-hidden
          className="bg-brand-orange/30 absolute top-1/3 -right-24 size-72 rounded-full blur-3xl"
        />
        <div className="relative flex h-full flex-col justify-between p-12 xl:p-16">
          <Link href="/" aria-label="Acroma home" className="w-fit">
            <Logo tone="light" className="h-9" />
          </Link>

          <div className="max-w-xl">
            <p className="text-brand-orange text-xs font-bold tracking-widest uppercase">
              {eyebrow}
            </p>
            <h1 className="mt-6 text-5xl leading-[1.03] font-bold tracking-tight xl:text-6xl">
              {headline}
            </h1>
            <p className="mt-6 max-w-md text-base leading-relaxed text-white/70">
              {body}
            </p>
          </div>

          <div className="flex items-center gap-3 text-xs text-white/55">
            <span className="bg-brand-orange/80 inline-block h-px w-10" />
            <span className="tracking-wide uppercase">
              Built for Ghana · Built for now
            </span>
          </div>
        </div>
      </aside>

      {/* Form column — plain on desktop, a card with the copy on mobile */}
      <main className="flex min-h-svh flex-col items-center justify-center px-6 py-12 sm:px-10">
        <div className="w-full max-w-md">
          <Link
            href="/"
            aria-label="Acroma home"
            className="mb-8 inline-flex w-fit lg:hidden"
          >
            <Logo className="h-8" />
          </Link>

          <div className="space-y-8 max-lg:rounded-[calc(var(--radius)*1.4)] max-lg:border max-lg:border-border max-lg:bg-card max-lg:p-8 max-lg:shadow-[0_10px_30px_-14px_rgba(60,40,20,0.22)]">
            <header className="space-y-3 lg:hidden">
              <p className="text-brand-orange text-xs font-bold tracking-widest uppercase">
                {eyebrow}
              </p>
              <h1 className="text-foreground text-2xl font-bold tracking-tight sm:text-3xl">
                {headline}
              </h1>
              <p className="text-muted-foreground text-sm leading-relaxed">
                {body}
              </p>
            </header>

            {children}
          </div>

          {footer ? (
            <div className="text-muted-foreground mt-6 text-center text-sm">
              {footer}
            </div>
          ) : null}
        </div>
      </main>
    </div>
  );
}
