import Link from "next/link";
import { Logo } from "@/components/brand/logo";
import { cn } from "@/lib/utils";

type AuthShellProps = {
  children: React.ReactNode;
  /** Editorial copy on the left panel (desktop only). */
  eyebrow: string;
  headline: React.ReactNode;
  body: string;
  footer?: React.ReactNode;
};

/**
 * Two-pane auth layout.
 * Mobile: brand bar at top, form below.
 * Desktop: full-height editorial panel left, form right with diagonal seam.
 */
export function AuthShell({
  children,
  eyebrow,
  headline,
  body,
  footer,
}: AuthShellProps) {
  return (
    <div className="grid min-h-svh lg:grid-cols-[minmax(0,1.05fr)_minmax(0,1fr)]">
      <EditorialPanel eyebrow={eyebrow} headline={headline} body={body} />
      <FormPanel footer={footer}>{children}</FormPanel>
    </div>
  );
}

function EditorialPanel({
  eyebrow,
  headline,
  body,
}: Pick<AuthShellProps, "eyebrow" | "headline" | "body">) {
  return (
    <aside
      className={cn(
        "relative hidden bg-secondary text-secondary-foreground lg:block",
        "surface-grain overflow-hidden",
      )}
    >
      {/* Diagonal accent — echoes the deck cover slash */}
      <div
        aria-hidden
        className="absolute inset-y-0 right-0 w-[18%] bg-background/[0.04]"
        style={{
          clipPath: "polygon(60% 0, 100% 0, 100% 100%, 0 100%)",
        }}
      />
      <div
        aria-hidden
        className="bg-brand-orange/40 absolute -right-24 top-1/3 h-72 w-72 rounded-full blur-3xl"
      />

      <div className="relative flex h-full flex-col justify-between p-12 xl:p-16">
        <Link
          href="/"
          className="inline-flex w-fit items-center gap-3"
          aria-label="Acroma home"
        >
          <Logo tone="light" className="text-3xl" />
        </Link>

        <div className="max-w-xl">
          <p className="eyebrow text-brand-orange">{eyebrow}</p>
          <h1 className="font-display mt-6 text-5xl leading-[0.95] font-medium tracking-[-0.02em] xl:text-6xl">
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
  );
}

function FormPanel({
  children,
  footer,
}: {
  children: React.ReactNode;
  footer?: React.ReactNode;
}) {
  return (
    <main className="bg-background relative flex min-h-svh flex-col">
      {/* Mobile brand bar */}
      <div className="flex items-center justify-between px-6 pt-6 lg:hidden">
        <Logo className="text-2xl" />
      </div>

      <div className="flex flex-1 items-center justify-center px-6 py-10 sm:px-10">
        <div className="w-full max-w-md">{children}</div>
      </div>

      {footer ? (
        <div className="text-muted-foreground border-border/60 border-t px-6 py-4 text-center text-sm sm:px-10">
          {footer}
        </div>
      ) : null}
    </main>
  );
}
