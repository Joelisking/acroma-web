"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { ImageUploader } from "@/components/shared/image-uploader";
import { cn } from "@/lib/utils";
import type { VariantDimension } from "@/lib/api/types";

type Props = {
  dimensions: VariantDimension[];
  onChange: (dims: VariantDimension[]) => void;
};

/**
 * Two-step UX for attaching photos to variant options.
 *
 *   1. Ask which dimensions need their own photo (e.g. Color but not Size).
 *   2. Show a row of `ImageUploader`s per option for each selected dimension.
 *
 * Ported from the mobile `VariantOptionImages` component to keep cross-platform
 * parity. Writes into `dimension.optionImages[option]` for each picker.
 */
export function VariantOptionImages({ dimensions, onChange }: Props) {
  const [selected, setSelected] = React.useState<string[]>(() =>
    dimensions
      .filter((d) => d.optionImages && Object.keys(d.optionImages).length > 0)
      .map((d) => d.name),
  );
  const [decided, setDecided] = React.useState(() =>
    dimensions.some(
      (d) => d.optionImages && Object.keys(d.optionImages).length > 0,
    ),
  );

  function toggleDim(name: string) {
    setSelected((prev) =>
      prev.includes(name) ? prev.filter((n) => n !== name) : [...prev, name],
    );
  }

  function confirm() {
    const updated = dimensions.map((dim) => {
      if (selected.includes(dim.name)) return dim;
      const { optionImages: _removed, ...rest } = dim;
      return rest;
    });
    onChange(updated);
    setDecided(true);
  }

  function handleImageChange(
    dimIndex: number,
    option: string,
    url: string | null,
  ) {
    const updated = dimensions.map((dim, i) => {
      if (i !== dimIndex) return dim;
      const optionImages = { ...(dim.optionImages ?? {}) };
      if (url) {
        optionImages[option] = url;
      } else {
        delete optionImages[option];
      }
      return { ...dim, optionImages };
    });
    onChange(updated);
  }

  if (!decided) {
    return (
      <div className="space-y-3">
        <div className="space-y-0.5">
          <p className="text-foreground text-sm font-medium">
            Add photos per option?
          </p>
          <p className="text-muted-foreground text-xs">
            Pick which dimensions need their own photo (e.g. Color but not
            Size).
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          {dimensions.map((dim) => {
            const active = selected.includes(dim.name);
            return (
              <button
                key={dim.name}
                type="button"
                onClick={() => toggleDim(dim.name)}
                className={cn(
                  "rounded-full border px-4 py-2 text-sm font-medium transition-colors",
                  active
                    ? "border-brand-orange bg-brand-orange/10 text-brand-orange"
                    : "border-border bg-background text-muted-foreground hover:text-foreground",
                )}
              >
                {active ? `✓ ${dim.name}` : dim.name}
              </button>
            );
          })}
        </div>

        <Button
          type="button"
          onClick={confirm}
          className="bg-brand-orange hover:bg-brand-orange/90 h-10 w-full rounded-xl"
        >
          {selected.length === 0 ? "Skip — no option photos" : "Continue"}
        </Button>
      </div>
    );
  }

  const activeDimensions = dimensions.filter((d) => selected.includes(d.name));
  if (activeDimensions.length === 0) return null;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-muted-foreground text-xs font-medium uppercase tracking-wider">
          Option photos
        </p>
        <button
          type="button"
          onClick={() => setDecided(false)}
          className="text-muted-foreground text-xs underline underline-offset-2"
        >
          Change
        </button>
      </div>

      {activeDimensions.map((dim) => {
        const dimIndex = dimensions.findIndex((d) => d.name === dim.name);
        return (
          <div key={dim.name} className="space-y-2">
            <p className="text-foreground text-sm font-medium">{dim.name}</p>
            <div className="-mx-4 overflow-x-auto px-4">
              <div className="flex gap-3">
                {dim.options.map((option) => (
                  <div key={option} className="w-20 shrink-0 space-y-1.5">
                    <ImageUploader
                      kind="variant"
                      aspect="aspect-square"
                      value={dim.optionImages?.[option] ?? null}
                      onChange={(url) =>
                        handleImageChange(dimIndex, option, url)
                      }
                    />
                    <p className="text-muted-foreground truncate text-center text-xs">
                      {option}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
