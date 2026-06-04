"use client";

import * as React from "react";
import { toast } from "sonner";
import { ImagePlus, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CatalogImageTile } from "./catalog-image-tile";
import {
  uploadImage,
  ImageUploadError,
  IMAGE_ACCEPT,
} from "@/lib/cloudinary-upload";
import { updateCatalogImagesAction } from "@/lib/api/settings-actions";

const MAX_IMAGES = 8;

type Props = {
  defaultUrls: string[];
  /** User-facing noun: "Catalog" or "Menu" (vertical-aware). */
  noun: string;
};

/**
 * Ordered multi-image picker. Merchants select several images at once, reorder
 * them with the per-tile arrows, then save. The saved order is the order
 * Acroma sends the images to customers on WhatsApp. Caps at MAX_IMAGES.
 */
export function CatalogImagesManager({ defaultUrls, noun }: Props) {
  const [urls, setUrls] = React.useState<string[]>(defaultUrls);
  // Baseline of what's persisted, so the Save button settles back to disabled
  // after a save (client state survives the server revalidation).
  const [savedUrls, setSavedUrls] = React.useState<string[]>(defaultUrls);
  const [pendingCount, setPendingCount] = React.useState(0);
  const [saving, startSaving] = React.useTransition();
  const inputRef = React.useRef<HTMLInputElement>(null);

  const remaining = MAX_IMAGES - urls.length - pendingCount;
  const dirty = !sameOrder(urls, savedUrls);

  function move(from: number, to: number) {
    setUrls((prev) => {
      if (to < 0 || to >= prev.length) return prev;
      const next = [...prev];
      const [moved] = next.splice(from, 1);
      next.splice(to, 0, moved);
      return next;
    });
  }

  function remove(index: number) {
    setUrls((prev) => prev.filter((_, i) => i !== index));
  }

  async function handleFiles(files: FileList) {
    const accepted = Array.from(files).slice(0, Math.max(0, remaining));
    if (files.length > accepted.length) {
      toast.error(`You can upload up to ${MAX_IMAGES} images`);
    }
    if (accepted.length === 0) return;

    setPendingCount((c) => c + accepted.length);
    await Promise.all(
      accepted.map(async (file) => {
        try {
          const url = await uploadImage(file, "catalog");
          setUrls((prev) => [...prev, url]);
        } catch (err) {
          toast.error(
            err instanceof ImageUploadError
              ? err.message
              : "Upload failed. Please try again",
          );
        } finally {
          setPendingCount((c) => c - 1);
        }
      }),
    );
  }

  function handleSave() {
    startSaving(async () => {
      const result = await updateCatalogImagesAction(urls);
      if (!result.ok) {
        toast.error(result.error);
        return;
      }
      setSavedUrls(result.data.catalogImageUrls);
      toast.success(`${noun} images saved`);
    });
  }

  return (
    <div className="space-y-5">
      {urls.length === 0 && pendingCount === 0 ? (
        <p className="text-muted-foreground text-sm">
          No images yet. Add a few photos of your {noun.toLowerCase()} and
          Acroma will send them when customers ask what you have.
        </p>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
          {urls.map((url, i) => (
            <CatalogImageTile
              key={url}
              url={url}
              index={i}
              total={urls.length}
              noun={noun}
              onMoveEarlier={() => move(i, i - 1)}
              onMoveLater={() => move(i, i + 1)}
              onRemove={() => remove(i)}
            />
          ))}
          {Array.from({ length: pendingCount }).map((_, i) => (
            <div
              key={`pending-${i}`}
              className="border-border/70 bg-muted flex aspect-[3/4] items-center justify-center rounded-2xl border"
            >
              <Loader2 className="text-brand-orange size-6 animate-spin" />
            </div>
          ))}
        </div>
      )}

      <input
        ref={inputRef}
        type="file"
        accept={IMAGE_ACCEPT}
        multiple
        className="hidden"
        onChange={(e) => {
          if (e.target.files?.length) void handleFiles(e.target.files);
          e.target.value = "";
        }}
      />

      <div className="flex flex-wrap items-center justify-between gap-3">
        <Button
          type="button"
          variant="outline"
          onClick={() => inputRef.current?.click()}
          disabled={remaining <= 0}
          className="gap-1.5"
        >
          <ImagePlus />
          Add images
        </Button>
        <Button onClick={handleSave} disabled={saving || !dirty}>
          {saving ? "Saving..." : "Save images"}
        </Button>
      </div>

      <p className="text-muted-foreground text-xs">
        {urls.length} of {MAX_IMAGES} added. Use the arrows to set the order
        Acroma sends them on WhatsApp.
      </p>
    </div>
  );
}

/** True when both arrays hold the same URLs in the same positions. */
function sameOrder(a: string[], b: string[]): boolean {
  if (a.length !== b.length) return false;
  return a.every((value, i) => value === b[i]);
}
