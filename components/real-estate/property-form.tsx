"use client"
import { useRouter } from "next/navigation"
import { useForm, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { toast } from "sonner"
import {
  listingInput,
  type Listing,
  type ListingInput,
} from "@/lib/real-estate"
import { saveProperty } from "@/lib/api/real-estate-actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { PropertyPhotos } from "./property-photos"

export function PropertyForm({
  property,
  currency,
}: {
  property?: Listing
  currency: string
}) {
  const router = useRouter()
  const form = useForm<ListingInput>({
    resolver: zodResolver(listingInput),
    defaultValues: property
      ? {
          ...property,
          bedrooms: property.bedrooms ?? undefined,
          bathrooms: property.bathrooms ?? undefined,
        }
      : {
          title: "",
          description: "",
          location: "",
          propertyType: "House",
          askingPrice: 0,
          currency,
          status: "AVAILABLE",
          imageUrls: [],
        },
  })
  async function submit(values: ListingInput) {
    const result = await saveProperty(values, property?.id)
    if (!result.ok) return toast.error(result.error)
    toast.success("Property saved")
    router.push("/dashboard/properties")
    router.refresh()
  }
  return (
    <form onSubmit={form.handleSubmit(submit)} className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2">
        {(
          [
            ["title", "Listing title"],
            ["location", "Location"],
            ["propertyType", "Property type"],
            ["currency", "Asking price currency"],
          ] as const
        ).map(([name, label]) => (
          <div key={name} className="space-y-2">
            <Label htmlFor={name}>{label}</Label>
            <Input id={name} {...form.register(name)} />
            {form.formState.errors[name] && (
              <p className="text-sm text-destructive">
                {form.formState.errors[name]?.message}
              </p>
            )}
          </div>
        ))}
        {(
          [
            ["askingPrice", "Asking price"],
            ["bedrooms", "Bedrooms (optional)"],
            ["bathrooms", "Bathrooms (optional)"],
          ] as const
        ).map(([name, label]) => (
          <div key={name} className="space-y-2">
            <Label htmlFor={name}>{label}</Label>
            <Input
              id={name}
              type="number"
              min={0}
              step={name === "askingPrice" ? "0.01" : "1"}
              {...form.register(name, {
                setValueAs: (v: string) => (v === "" ? undefined : Number(v)),
              })}
            />
            {form.formState.errors[name] && (
              <p className="text-sm text-destructive">
                {form.formState.errors[name]?.message}
              </p>
            )}
          </div>
        ))}
        <div className="space-y-2">
          <Label htmlFor="property-status">Availability</Label>
          <Controller
            control={form.control}
            name="status"
            render={({ field }) => (
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger id="property-status">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {(
                    [
                      ["AVAILABLE", "Available"],
                      ["UNDER_OFFER", "Under offer"],
                      ["SOLD", "Sold"],
                      ["ARCHIVED", "Archived"],
                    ] as const
                  ).map(([value, label]) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="description">Property details</Label>
        <Textarea
          id="description"
          rows={5}
          {...form.register("description")}
          placeholder="Describe the property and verified features buyers should know."
        />
        <p className="text-sm text-destructive">
          {form.formState.errors.description?.message}
        </p>
      </div>
      <Controller
        control={form.control}
        name="imageUrls"
        render={({ field }) => (
          <PropertyPhotos value={field.value} onChange={field.onChange} />
        )}
      />
      <p className="text-sm text-destructive">
        {form.formState.errors.imageUrls?.message}
      </p>
      <p className="text-sm text-muted-foreground">
        Asking prices help buyers find listings. Acroma only collects
        appointment fees.
      </p>
      <Button disabled={form.formState.isSubmitting}>
        {form.formState.isSubmitting ? "Saving…" : "Save property"}
      </Button>
    </form>
  )
}
