"use client";

import * as React from "react";
import { ArrowRight, Loader2 } from "lucide-react";
import { toast } from "sonner";

import { handoffAction } from "@/lib/api/conversations-actions";
import { cn } from "@/lib/utils";

type Props = {
  conversationId: string;
  label?: string;
};

const KNOB = 44; // px, matches .slideover .knob width
const PAD = 4; // px, matches .slideover .knob left inset
const THRESHOLD = 0.9; // fraction of travel that commits the action

/**
 * Slide-to-take-over control. Dragging the knob to the end (or pressing
 * Enter / Space / ArrowRight) hands the conversation to the owner via the
 * existing `handoffAction`. Keyboard-operable and reduced-motion aware.
 */
export function SlideToTakeOver({
  conversationId,
  label = "Slide to take over",
}: Props) {
  const trackRef = React.useRef<HTMLDivElement>(null);
  const knobRef = React.useRef<HTMLButtonElement>(null);
  // leftPx is the knob's CSS left value; progress is stored separately for the
  // threshold check. Both are derived from pointer events (ref reads happen
  // in handlers, not during render).
  const [leftPx, setLeftPx] = React.useState(PAD);
  const progressRef = React.useRef(0);
  const [dragging, setDragging] = React.useState(false);
  const [pending, setPending] = React.useState(false);

  function travelPx(): number {
    const track = trackRef.current;
    if (!track) return 1;
    return Math.max(1, track.clientWidth - KNOB - PAD * 2);
  }

  function commit() {
    if (pending) return;
    setPending(true);
    setLeftPx((travelPx() + PAD)); // snap to end
    void handoffAction(conversationId, "TAKE_OVER").then((result) => {
      if (!result.ok) {
        toast.error(result.error);
        setPending(false);
        setLeftPx(PAD);
        progressRef.current = 0;
        return;
      }
      // Success: handoffAction revalidates the route, which re-renders this
      // view into the owner-in-control composer. Leave the knob settled.
    });
  }

  function onPointerDown(e: React.PointerEvent) {
    if (pending) return;
    setDragging(true);
    knobRef.current?.setPointerCapture(e.pointerId);
  }

  function onPointerMove(e: React.PointerEvent) {
    if (!dragging) return;
    const track = trackRef.current;
    if (!track) return;
    const rect = track.getBoundingClientRect();
    const raw = e.clientX - rect.left - PAD - KNOB / 2;
    const t = travelPx();
    const progress = Math.max(0, Math.min(1, raw / t));
    progressRef.current = progress;
    setLeftPx(PAD + progress * t);
  }

  function onPointerUp(e: React.PointerEvent) {
    if (!dragging) return;
    setDragging(false);
    knobRef.current?.releasePointerCapture(e.pointerId);
    if (progressRef.current >= THRESHOLD) commit();
    else {
      setLeftPx(PAD);
      progressRef.current = 0;
    }
  }

  function onKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter" || e.key === " " || e.key === "ArrowRight") {
      e.preventDefault();
      commit();
    }
  }

  return (
    <div>
      <div ref={trackRef} className="slideover">
        <span className="track-label">{label}</span>
        <button
          ref={knobRef}
          type="button"
          aria-label={label}
          disabled={pending}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerUp}
          onKeyDown={onKeyDown}
          style={{ left: `${leftPx}px` }}
          className={cn(
            "knob focus-visible:ring-ring focus-visible:ring-2 focus-visible:outline-none",
            dragging
              ? ""
              : "motion-safe:transition-[left] motion-safe:duration-200",
          )}
        >
          {pending ? (
            <Loader2 className="size-[18px] animate-spin" />
          ) : (
            <ArrowRight className="size-[18px]" strokeWidth={2.4} />
          )}
        </button>
      </div>
      <p className="text-muted-foreground mt-2 text-center text-xs">
        Acroma pauses the moment you step in
      </p>
    </div>
  );
}
