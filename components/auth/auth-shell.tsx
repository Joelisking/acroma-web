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
 * Soft Stack auth layout.
 * A single calm, centered card on the warm paper canvas — brand mark, a short
 * supporting line, the form, and an optional footer link.
 */
export function AuthShell({
  children,
  eyebrow,
  headline,
  body,
  footer,
}: AuthShellProps) {
  return (
    <div className="bg-paper flex min-h-svh flex-col items-center justify-center px-6 py-12 sm:px-10">
      <div className="w-full max-w-md">
        <Link
          href="/"
          className="mb-8 inline-flex w-fit items-center gap-3"
          aria-label="Acroma home"
        >
          <Logo className="h-8" />
        </Link>

        <div className="card-warm space-y-8 p-8 sm:p-10">
          <header className="space-y-3">
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
    </div>
  );
}
