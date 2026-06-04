"use client";

import * as React from "react";
import { ImagePlus, Loader2, X } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  uploadImage,
  ImageUploadError,
  IMAGE_ACCEPT,
  type UploadKind,
} from "@/lib/cloudinary-upload";
import { cn } from "@/lib/utils";

type ImageUploaderProps = {
  value: string | null | undefined;
  onChange: (url: string | null) => void;
  /** Cloudinary folder; uploaded asset lives at `acroma/<kind>/…`. */
  kind: UploadKind;
  /** Tailwind aspect ratio class. Defaults to square. */
  aspect?: string;
  className?: string;
  "aria-label"?: string;
};

/**
 * Single-image picker built on the shared `uploadImage` helper. Same cloud +
 * preset the mobile app uses, so a single asset library covers both clients.
 */
export function ImageUploader({
  value,
  onChange,
  kind,
  aspect = "aspect-square",
  className,
  "aria-label": ariaLabel,
}: ImageUploaderProps) {
  const [pending, setPending] = React.useState(false);
  const inputRef = React.useRef<HTMLInputElement>(null);

  async function handleFile(file: File) {
    setPending(true);
    try {
      const url = await uploadImage(file, kind);
      onChange(url);
    } catch (err) {
      toast.error(
        err instanceof ImageUploadError
          ? err.message
          : "Upload failed. Please try again",
      );
    } finally {
      setPending(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  function clear() {
    onChange(null);
  }

  return (
    <div className={cn("space-y-2", className)} aria-label={ariaLabel}>
      <div
        className={cn(
          "border-border/70 bg-muted relative overflow-hidden rounded-2xl border",
          aspect,
        )}
      >
        {value ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={value}
            alt=""
            className="absolute inset-0 size-full object-cover"
          />
        ) : (
          <div className="text-muted-foreground absolute inset-0 flex flex-col items-center justify-center gap-2">
            <ImagePlus className="size-8" strokeWidth={1.25} />
            <p className="text-xs">No image yet</p>
          </div>
        )}
        {pending ? (
          <div className="bg-background/70 absolute inset-0 flex items-center justify-center backdrop-blur-sm">
            <Loader2 className="text-brand-orange size-6 animate-spin" />
          </div>
        ) : null}
      </div>

      <div className="flex items-center gap-2">
        <input
          ref={inputRef}
          type="file"
          accept={IMAGE_ACCEPT}
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) void handleFile(file);
          }}
        />
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => inputRef.current?.click()}
          disabled={pending}
          className="gap-1.5"
        >
          <ImagePlus />
          {value ? "Replace" : "Upload"}
        </Button>
        {value ? (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={clear}
            disabled={pending}
            className="text-muted-foreground hover:text-foreground gap-1.5"
          >
            <X />
            Remove
          </Button>
        ) : null}
      </div>
    </div>
  );
}
