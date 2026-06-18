import { Check, Plug, TriangleAlert } from "lucide-react";
import { cn } from "@/lib/utils";

type WhatsappStatusProps = {
  /** True once credentials have been connected at least once. */
  active: boolean;
  /** False when the stored token was last seen failing. */
  healthy: boolean;
  /** Human-readable reason the connection broke, shown when unhealthy. */
  lastError?: string | null;
};

type Variant = {
  icon: typeof Check;
  title: string;
  description: string;
  wrap: string;
  badge: string;
  titleColor: string;
  descColor: string;
};

function resolveVariant(
  active: boolean,
  healthy: boolean,
  lastError?: string | null,
): Variant {
  if (active && !healthy) {
    return {
      icon: TriangleAlert,
      title: "Needs reconnecting",
      description:
        lastError?.trim() ||
        "Acroma cannot send messages on your WhatsApp number. Re-add your credentials below to bring it back online.",
      wrap: "border-destructive/30 bg-destructive/5",
      badge: "bg-destructive/10 text-destructive",
      titleColor: "text-destructive",
      descColor: "text-destructive/80",
    };
  }
  if (active) {
    return {
      icon: Check,
      title: "Connected and live",
      description: "Acroma is replying to messages on your WhatsApp number.",
      wrap: "border-brand-green/25 bg-brand-green-soft",
      badge: "bg-brand-green/15 text-brand-green",
      titleColor: "text-brand-green",
      descColor: "text-brand-navy/70",
    };
  }
  return {
    icon: Plug,
    title: "Not yet connected",
    description: "Add your credentials below to bring Acroma online.",
    wrap: "border-border/70 bg-muted/40",
    badge: "bg-background text-muted-foreground",
    titleColor: "text-foreground",
    descColor: "text-muted-foreground",
  };
}

export function WhatsappStatus({
  active,
  healthy,
  lastError,
}: WhatsappStatusProps) {
  const variant = resolveVariant(active, healthy, lastError);
  const Icon = variant.icon;
  const isConnected = active && healthy;

  return (
    <div
      className={cn(
        "flex items-center gap-3 rounded-2xl border p-4",
        variant.wrap,
      )}
    >
      <span
        className={cn(
          "flex size-9 items-center justify-center rounded-xl",
          variant.badge,
        )}
      >
        <Icon
          className="size-5"
          strokeWidth={isConnected ? 2.5 : 1.75}
          aria-hidden
        />
      </span>
      <div>
        <p className={cn("text-sm font-medium", variant.titleColor)}>
          {variant.title}
        </p>
        <p className={cn("text-xs", variant.descColor)}>{variant.description}</p>
      </div>
    </div>
  );
}
