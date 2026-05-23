"use client";

import { Bell, Loader2, Smartphone } from "lucide-react";
import { toast } from "sonner";

import { useWebPush } from "@/hooks/use-web-push";
import { useClientValue } from "@/hooks/use-client-value";
import { isIos, isStandalone } from "@/lib/pwa/detect";
import { cn } from "@/lib/utils";
import { InstallPrompt } from "@/components/pwa/install-prompt";

const TRIGGERS = [
  "A new order is placed in WhatsApp",
  "A customer's payment is confirmed (or fails)",
  "Acroma escalates a chat that needs you",
];

export function PushNotificationsCard() {
  const { supported, permission, subscribed, busy, enable, disable } =
    useWebPush();
  // On iOS, web push only works once the app is installed to the Home Screen.
  const iosNeedsInstall = useClientValue(
    () => isIos() && !isStandalone(),
    false,
  );

  const enabled = subscribed && permission === "granted";

  async function toggle() {
    if (busy) return;
    if (enabled) {
      await disable();
      toast.success("Device notifications turned off");
      return;
    }
    const res = await enable();
    if (res.ok) toast.success("Device notifications turned on");
    else if (res.error) toast.error(res.error);
  }

  // On iOS, web push only works once the app is added to the Home Screen.
  if (iosNeedsInstall) {
    return (
      <div className="space-y-4">
        <div className="flex items-start gap-3 rounded-2xl border border-border/70 bg-muted/40 p-4">
          <span className="bg-background text-muted-foreground flex size-9 shrink-0 items-center justify-center rounded-xl">
            <Smartphone className="size-5" strokeWidth={1.75} />
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-foreground text-sm font-medium">
              Add Acroma to your Home Screen first
            </p>
            <p className="text-muted-foreground mt-1 text-xs">
              On iPhone and iPad, notifications work once Acroma is installed.
              Tap the Share button in Safari, then{" "}
              <span className="text-foreground font-medium">
                Add to Home Screen
              </span>
              . Open Acroma from the new icon and come back here to turn
              notifications on.
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (!supported) {
    return (
      <div className="flex items-start gap-3 rounded-2xl border border-border/70 bg-muted/40 p-4">
        <span className="bg-background text-muted-foreground flex size-9 shrink-0 items-center justify-center rounded-xl">
          <Bell className="size-5" strokeWidth={1.75} />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-foreground text-sm font-medium">
            Notifications aren&apos;t available in this browser
          </p>
          <p className="text-muted-foreground mt-1 text-xs">
            Try a recent version of Chrome, Edge, or Safari, or install Acroma
            to your device.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div
        className={cn(
          "flex items-center gap-3 rounded-2xl border p-4 transition-colors",
          enabled
            ? "border-brand-orange/25 bg-brand-orange-soft"
            : "border-border/70 bg-muted/40",
        )}
      >
        <span
          className={cn(
            "flex size-9 shrink-0 items-center justify-center rounded-xl",
            enabled
              ? "bg-brand-orange/15 text-brand-orange"
              : "bg-background text-muted-foreground",
          )}
        >
          <Bell className="size-5" strokeWidth={1.75} />
        </span>
        <div className="min-w-0 flex-1">
          <p
            className={cn(
              "text-sm font-medium",
              enabled ? "text-brand-orange" : "text-foreground",
            )}
          >
            Device notifications {enabled ? "are on" : "are off"}
          </p>
          <p className="text-muted-foreground truncate text-xs">
            {enabled
              ? "This device will alert you, even when the dashboard is closed."
              : "Turn on to get alerts on this device."}
          </p>
        </div>
        <button
          type="button"
          role="switch"
          aria-checked={enabled}
          aria-label="Toggle device notifications"
          onClick={toggle}
          disabled={busy}
          className={cn(
            "relative h-6 w-11 shrink-0 rounded-full transition-colors",
            enabled ? "bg-brand-orange" : "bg-muted-foreground/30",
          )}
        >
          {busy ? (
            <Loader2 className="absolute top-1/2 left-1/2 size-3 -translate-x-1/2 -translate-y-1/2 animate-spin text-white" />
          ) : null}
          <span
            className={cn(
              "absolute top-0.5 left-0.5 size-5 rounded-full bg-white shadow-sm transition-transform",
              enabled && "translate-x-5",
            )}
          />
        </button>
      </div>

      {permission === "denied" ? (
        <p className="text-muted-foreground text-xs">
          Notifications are blocked for this site. Re-enable them in your
          browser&apos;s site settings, then turn the switch on again.
        </p>
      ) : (
        <div>
          <p className="text-foreground text-xs font-semibold tracking-wider uppercase">
            You&apos;ll get a notification when…
          </p>
          <ul className="mt-3 space-y-2">
            {TRIGGERS.map((line) => (
              <li
                key={line}
                className="text-foreground flex items-start gap-2 text-sm"
              >
                <span
                  aria-hidden
                  className="bg-brand-orange mt-2 inline-block size-1.5 shrink-0 rounded-full"
                />
                {line}
              </li>
            ))}
          </ul>
        </div>
      )}

      <InstallPrompt />
    </div>
  );
}
