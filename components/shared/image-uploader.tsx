"use client";

import * as React from "react";
import { ImagePlus, Loader2, X } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const MAX_BYTES = 5 * 1024 * 1024; // 5 MB
const ACCEPT = "image/png, image/jpeg, image/webp, image/avif";

const CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
const UPLOAD_PRESET = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

type ImageUploaderProps = {
  value: string | null | undefined;
  onChange: (url: string | null) => void;
  /** Cloudinary folder; uploaded asset lives at `acroma/<kind>/…`. */
  kind: "logo" | "product" | "variant" | "catalog";
  /** Tailwind aspect ratio class. Defaults to square. */
  aspect?: string;
  className?: string;
};

type CloudinaryResponse = {
  secure_url: string;
};

/**
 * Direct browser → Cloudinary uploader using an unsigned upload preset.
 * Same cloud + preset the mobile app uses, so a single asset library
 * covers both clients. The backend never sees the file.
 */
export function ImageUploader({
  value,
  onChange,
  kind,
  aspect = "aspect-square",
  className,
}: ImageUploaderProps) {
  const [pending, setPending] = React.useState(false);
  const inputRef = React.useRef<HTMLInputElement>(null);

  async function handleFile(file: File) {
    if (!CLOUD_NAME || !UPLOAD_PRESET) {
      toast.error("Cloudinary is not configured");
      return;
    }
    if (file.size > MAX_BYTES) {
      toast.error("Image is over 5 MB");
      return;
    }
    setPending(true);
    try {
      const form = new FormData();
      form.append("file", file);
      form.append("upload_preset", UPLOAD_PRESET);
      form.append("folder", `acroma/${kind}`);

      const res = await fetch(
        `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
        { method: "POST", body: form },
      );
      if (!res.ok) {
        toast.error("Upload failed — please try again");
        return;
      }
      const json = (await res.json()) as CloudinaryResponse;
      onChange(json.secure_url);
    } catch {
      toast.error("Upload failed — please try again");
    } finally {
      setPending(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  function clear() {
    onChange(null);
  }

  return (
    <div className={cn("space-y-2", className)}>
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
          accept={ACCEPT}
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
