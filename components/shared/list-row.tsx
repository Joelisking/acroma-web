import type { ReactNode } from "react";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

type ListRowProps = {
  /** Leading slot — usually an Avatar or icon tile. */
  leading?: ReactNode;
  title: ReactNode;
  subtitle?: ReactNode;
  /** Top-right slot — usually a relative timestamp. */
  meta?: ReactNode;
  /** Trailing slot — overrides the chevron when provided. */
  trailing?: ReactNode;
  href?: string;
  onClick?: () => void;
  active?: boolean;
  /** Lift the row out of the list with a warm tint (e.g. "waiting on you"). */
  highlight?: boolean;
  showChevron?: boolean;
  className?: string;
};

/**
 * The one list-row primitive: avatar/leading + title + subtitle + meta +
 * trailing. Renders as a Link when `href` is set, otherwise a button. Generalises
 * the conversation/order/customer rows so every list shares spacing, hover, and
 * active/highlight states.
 */
export function ListRow({
  leading,
  title,
  subtitle,
  meta,
  trailing,
  href,
  onClick,
  active,
  highlight,
  showChevron,
  className,
}: ListRowProps) {
  const inner = (
    <>
      {leading ? <div className="shrink-0">{leading}</div> : null}
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <div className="text-foreground min-w-0 flex-1 truncate text-[0.95rem] font-semibold">
            {title}
          </div>
          {meta ? (
            <div className="text-muted-foreground shrink-0 text-xs tabular-nums">{meta}</div>
          ) : null}
        </div>
        {subtitle ? (
          <div className="text-muted-foreground mt-0.5 truncate text-xs">{subtitle}</div>
        ) : null}
      </div>
      {trailing ??
        (showChevron ? (
          <ChevronRight className="text-muted-foreground/50 size-4 shrink-0" />
        ) : null)}
    </>
  );

  const classes = cn(
    "group/row flex items-center gap-3 px-3 py-3 transition-colors",
    highlight
      ? "bg-brand-orange-soft/60 hover:bg-brand-orange-soft"
      : "hover:bg-accent/50",
    active && !highlight && "bg-accent/60",
    className,
  );

  if (href) {
    return (
      <Link href={href} aria-current={active ? "true" : undefined} className={classes}>
        {inner}
      </Link>
    );
  }

  return (
    <button type="button" onClick={onClick} className={cn(classes, "w-full text-left")}>
      {inner}
    </button>
  );
}
