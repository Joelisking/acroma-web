"use client";

import { ArrowLeft, ArrowRight, X } from "lucide-react";
import { Button } from "@/components/ui/button";

type Props = {
  url: string;
  index: number;
  total: number;
  /** User-facing noun: "Catalog" or "Menu". */
  noun: string;
  onMoveEarlier: () => void;
  onMoveLater: () => void;
  onRemove: () => void;
};

/**
 * One image in the ordered catalog-images grid. The badge shows its position
 * (1-based) — the order Acroma sends the images on WhatsApp. Arrows nudge the
 * image earlier or later; the picker handles drag-free reordering for touch.
 */
export function CatalogImageTile({
  url,
  index,
  total,
  noun,
  onMoveEarlier,
  onMoveLater,
  onRemove,
}: Props) {
  const label = noun.toLowerCase();
  return (
    <div className="border-border/70 bg-muted relative aspect-[3/4] overflow-hidden rounded-2xl border">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={url}
        alt={`${noun} image ${index + 1}`}
        className="absolute inset-0 size-full object-cover"
      />

      <span className="bg-background/80 text-foreground absolute top-2 left-2 rounded-full px-2 py-0.5 text-xs font-medium tabular-nums backdrop-blur-sm">
        {index + 1}
      </span>

      <Button
        type="button"
        size="icon-sm"
        variant="secondary"
        onClick={onRemove}
        aria-label={`Remove ${label} image ${index + 1}`}
        className="absolute top-2 right-2 rounded-full"
      >
        <X />
      </Button>

      <div className="absolute inset-x-2 bottom-2 flex items-center justify-between gap-2">
        <Button
          type="button"
          size="icon-sm"
          variant="secondary"
          onClick={onMoveEarlier}
          disabled={index === 0}
          aria-label={`Move ${label} image ${index + 1} earlier`}
          className="rounded-full"
        >
          <ArrowLeft />
        </Button>
        <Button
          type="button"
          size="icon-sm"
          variant="secondary"
          onClick={onMoveLater}
          disabled={index === total - 1}
          aria-label={`Move ${label} image ${index + 1} later`}
          className="rounded-full"
        >
          <ArrowRight />
        </Button>
      </div>
    </div>
  );
}
