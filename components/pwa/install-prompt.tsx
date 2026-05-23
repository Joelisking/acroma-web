"use client";

import { Download } from "lucide-react";

import { cn } from "@/lib/utils";
import { useInstallPrompt } from "@/hooks/use-install-prompt";

/**
 * Modest "Install app" affordance. Renders only when the browser has offered
 * a one-tap install (Chromium Android/desktop). iOS has no such event — the
 * settings card and the tutorial show Add-to-Home-Screen steps there instead.
 */
export function InstallPrompt({ className }: { className?: string }) {
  const { canInstall, promptInstall } = useInstallPrompt();
  if (!canInstall) return null;

  return (
    <button
      type="button"
      onClick={() => void promptInstall()}
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
