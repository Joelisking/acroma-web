"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { ArrowDown, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { isStandalone } from "@/lib/pwa/detect";

type PullToRefreshProps = {
  /** id of the scroll container to attach the gesture to. */
  targetId: string;
};

// Finger travel (px) needed to arm a refresh, and the visual travel ceiling.
const THRESHOLD = 64;
const MAX_PULL = 96;
// Travel is dampened so the indicator trails the finger rather than tracking
// it 1:1 — the standard rubber-band feel.
const RESISTANCE = 0.5;

/**
 * Custom pull-to-refresh for the installed (standalone) PWA. The browser
 * disables native pull-to-refresh in standalone display mode and our service
 * worker has no fetch handler, so there is otherwise no way to reload. We only
 * arm this when running standalone; in a normal tab the browser's own gesture
 * stays in charge.
 *
 * Pulling down from the top of the scroll container drags an indicator into
 * view; releasing past the threshold runs `router.refresh()` inside a
 * transition so the spinner stays until the server re-render lands.
 */
export function PullToRefresh({ targetId }: PullToRefreshProps) {
  const router = useRouter();
  const [pull, setPull] = React.useState(0);
  const [dragging, setDragging] = React.useState(false);
  const [isPending, startTransition] = React.useTransition();
  const gesture = React.useRef({ startX: 0, startY: 0, tracking: false });

  React.useEffect(() => {
    if (!isStandalone()) return;
    const el = document.getElementById(targetId);
    if (!el) return;

    const onStart = (e: TouchEvent) => {
      // Only engage when the touch begins at the top of every scrollable
      // region between the finger and the container — otherwise a downward
      // pull belongs to an inner scroll (e.g. a conversation thread).
      gesture.current.tracking = atScrollTop(e.target, el);
      gesture.current.startX = e.touches[0].clientX;
      gesture.current.startY = e.touches[0].clientY;
    };

    const onMove = (e: TouchEvent) => {
      if (!gesture.current.tracking) return;
      const dx = e.touches[0].clientX - gesture.current.startX;
      const dy = e.touches[0].clientY - gesture.current.startY;
      // Ignore upward and horizontal-dominant gestures.
      if (dy <= 0 || Math.abs(dx) > Math.abs(dy)) {
        gesture.current.tracking = false;
        setPull(0);
        return;
      }
      setDragging(true);
      setPull(Math.min(MAX_PULL, dy * RESISTANCE));
      // Suppress the native overscroll bounce while we own the gesture.
      if (e.cancelable) e.preventDefault();
    };

    const onEnd = () => {
      if (!gesture.current.tracking) return;
      gesture.current.tracking = false;
      setDragging(false);
      setPull((current) => {
        if (current >= THRESHOLD) startTransition(() => router.refresh());
        return 0;
      });
    };

    el.addEventListener("touchstart", onStart, { passive: true });
    el.addEventListener("touchmove", onMove, { passive: false });
    el.addEventListener("touchend", onEnd, { passive: true });
    el.addEventListener("touchcancel", onEnd, { passive: true });
    return () => {
      el.removeEventListener("touchstart", onStart);
      el.removeEventListener("touchmove", onMove);
      el.removeEventListener("touchend", onEnd);
      el.removeEventListener("touchcancel", onEnd);
    };
  }, [targetId, router]);

  const active = pull > 0 || isPending;
  const ready = pull >= THRESHOLD;
  const offset = isPending ? THRESHOLD : pull;

  return (
    <div
      aria-hidden={!active}
      aria-live="polite"
      className="pointer-events-none fixed inset-x-0 top-0 z-50 flex justify-center"
    >
      <div
        className={cn(
          "mt-2 flex size-10 items-center justify-center rounded-full",
          "bg-card text-brand-orange shadow-md ring-1 ring-border",
          !dragging && "transition-[transform,opacity] duration-200",
        )}
        style={{ transform: `translateY(${offset}px)`, opacity: active ? 1 : 0 }}
      >
        {isPending ? (
          <Loader2 className="size-5 animate-spin" />
        ) : (
          <ArrowDown
            className={cn(
              "size-5 transition-transform duration-200",
              ready && "rotate-180",
            )}
          />
        )}
        <span className="sr-only">
          {isPending
            ? "Refreshing"
            : ready
              ? "Release to refresh"
              : "Pull to refresh"}
        </span>
      </div>
    </div>
  );
}

/**
 * True when `target` and every scrollable ancestor up to (and including)
 * `container` are scrolled to the very top — i.e. a downward pull here is not
 * stealing scroll from an inner region.
 */
function atScrollTop(target: EventTarget | null, container: HTMLElement) {
  let node = target instanceof HTMLElement ? target : null;
  const stop = container.parentElement;
  while (node && node !== stop) {
    if (node.scrollTop > 0) return false;
    node = node.parentElement;
  }
  return true;
}
