"use client";

import * as React from "react";
import { Mail, Loader2 } from "lucide-react";
import { toast } from "sonner";

import { updateBusinessAction } from "@/lib/api/business-actions";
import type { Business } from "@/lib/api/types";
import { cn } from "@/lib/utils";

const TRIGGERS = [
  "A new order is placed in WhatsApp",
  "A customer's payment is confirmed (or fails)",
  "Acroma escalates a chat that needs you",
];

export function EmailNotificationsCard({ business }: { business: Business }) {
  const [enabled, setEnabled] = React.useState(business.emailNotificationsEnabled);
  const [pending, startTransition] = React.useTransition();

  function toggle() {
    const next = !enabled;
    setEnabled(next); // optimistic
    startTransition(async () => {
      const result = await updateBusinessAction({
        emailNotificationsEnabled: next,
      });
      if (!result.ok) {
        setEnabled(!next);
        toast.error(result.error);
        return;
      }
      toast.success(next ? "Emails turned on" : "Emails turned off");
    });
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
          <Mail className="size-5" strokeWidth={1.75} />
        </span>
        <div className="min-w-0 flex-1">
          <p
            className={cn(
              "text-sm font-medium",
              enabled ? "text-brand-orange" : "text-foreground",
            )}
          >
            Email notifications {enabled ? "are on" : "are off"}
          </p>
          <p className="text-muted-foreground truncate text-xs">
            {enabled ? (
              <>
                We&apos;ll email{" "}
                <span className="text-foreground font-medium">
                  {business.email}
                </span>
              </>
            ) : (
              <>You won&apos;t get emails for new activity.</>
            )}
          </p>
        </div>
        <button
          type="button"
          role="switch"
          aria-checked={enabled}
          onClick={toggle}
          disabled={pending}
          className={cn(
            "relative h-6 w-11 shrink-0 rounded-full transition-colors",
            enabled ? "bg-brand-orange" : "bg-muted-foreground/30",
          )}
        >
          {pending ? (
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

      <div>
        <p className="text-foreground text-xs font-semibold uppercase tracking-wider">
          You&apos;ll get an email when…
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

      <p className="text-muted-foreground text-xs">
        To change the email address, update your business profile. Want alerts
        on your phone or laptop even when the dashboard is closed? Turn on
        device notifications above.
      </p>
    </div>
  );
}
