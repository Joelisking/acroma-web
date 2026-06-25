"use client";

import * as React from "react";
import { Pin, PinOff } from "lucide-react";
import { toast } from "sonner";
import { setHomePreferenceAction } from "@/lib/api/home-preference-actions";
import type { HomeSurface } from "@/lib/home-preference";
import { cn } from "@/lib/utils";

/**
 * Lets a merchant pin the current surface as the one the app opens on. Shows a
 * quiet "Opens here" state when this surface is already home, or a "Set as
 * home" button otherwise. Optimistic — flips on click, server cookie follows.
 */
export function HomePreferenceToggle({
  surface,
  isHome,
  className,
}: {
  surface: HomeSurface;
  isHome: boolean;
  className?: string;
}) {
  const [home, setHome] = React.useState(isHome);
  const [pending, startTransition] = React.useTransition();

  function setAsHome() {
    setHome(true);
    startTransition(async () => {
      const result = await setHomePreferenceAction(surface);
      if (!result.ok) {
        setHome(false);
        toast.error("Couldn't update your home surface");
      } else {
        toast.success("This opens first now");
      }
    });
  }

  if (home) {
    return (
      <span
        className={cn(
          "text-muted-foreground inline-flex h-8 items-center gap-1.5 rounded-lg px-2.5 text-[0.8rem] font-medium",
          className,
        )}
      >
        <Pin className="size-3.5 fill-current" />
        Opens here
      </span>
    );
  }

  return (
    <button
      type="button"
      onClick={setAsHome}
      disabled={pending}
      className={cn(
        "text-muted-foreground hover:text-foreground hover:bg-muted inline-flex h-8 items-center gap-1.5 rounded-lg px-2.5 text-[0.8rem] font-medium transition-colors disabled:opacity-50",
        className,
      )}
    >
      <PinOff className="size-3.5" />
      Set as home
    </button>
  );
}
