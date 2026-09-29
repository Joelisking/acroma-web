"use client"
import Image from "next/image"
import { ImageUploader } from "@/components/shared/image-uploader"
import { Button } from "@/components/ui/button"

export function PropertyPhotos({
  value,
  onChange,
}: {
  value: string[]
  onChange: (urls: string[]) => void
}) {
  return (
    <fieldset className="space-y-3">
      <legend className="text-sm font-medium">Property photos</legend>
      <p className="text-sm text-muted-foreground">
        Add up to 20 photos. The first photo is the cover.
      </p>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {value.map((url, index) => (
          <div key={url} className="space-y-2">
            <Image
              src={url}
              alt={`Property photo ${index + 1}`}
              width={320}
              height={220}
              unoptimized
              className="aspect-video w-full rounded-xl object-cover"
            />
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={() => onChange(value.filter((v) => v !== url))}
            >
              Remove photo {index + 1}
            </Button>
          </div>
        ))}
        {value.length < 20 && (
          <ImageUploader
            value={null}
            onChange={(url) => {
              if (url && !value.includes(url)) onChange([...value, url])
            }}
            kind="product"
            aspect="aspect-video"
            aria-label="Add a property photo"
          />
        )}
      </div>
    </fieldset>
  )
}
