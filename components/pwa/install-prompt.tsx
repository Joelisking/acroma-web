"use client";

import * as React from "react";
import { Download } from "lucide-react";

import { cn } from "@/lib/utils";

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

/**
 * Modest "Install app" affordance. Renders only when the browser fires
 * `beforeinstallprompt` (Chrome/Edge/Android) and the app isn't installed.
 * iOS has no such event — the settings card shows Add-to-Home-Screen steps
 * there instead.
 */
export function InstallPrompt({ className }: { className?: string }) {
  const [deferred, setDeferred] =
    React.useState<BeforeInstallPromptEvent | null>(null);

  React.useEffect(() => {
    function onBeforeInstall(event: Event) {
      event.preventDefault();
      setDeferred(event as BeforeInstallPromptEvent);
    }
    window.addEventListener("beforeinstallprompt", onBeforeInstall);
    return () =>
      window.removeEventListener("beforeinstallprompt", onBeforeInstall);
  }, []);

  if (!deferred) return null;

  async function install() {
    if (!deferred) return;
    await deferred.prompt();
    await deferred.userChoice;
    setDeferred(null);
  }

  return (
    <button
      type="button"
      onClick={install}
      className={cn(
        "inline-flex items-center gap-2 rounded-xl border border-brand-orange/25",
        "bg-brand-orange-soft px-3 py-2 text-sm font-medium text-brand-orange",
        "transition-colors hover:bg-brand-orange/15",
        "focus-visible:ring-ring focus-visible:ring-2 focus-visible:outline-none",
        className,
      )}
    >
      <Download className="size-4" strokeWidth={1.75} />
      Install Acroma on this device
    </button>
  );
}
