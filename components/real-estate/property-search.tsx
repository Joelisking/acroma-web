"use client"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
const schema = z.object({
  location: z.string().max(150),
  maxBudget: z.string().regex(/^\d*(\.\d{1,2})?$/, "Enter a valid budget"),
  currency: z.string().regex(/^[A-Z]{3}$/),
})
export function PropertySearch({ currency }: { currency: string }) {
  const router = useRouter()
  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: { location: "", maxBudget: "", currency },
  })
  return (
    <form
      onSubmit={form.handleSubmit((values) =>
        router.push(`/dashboard/properties?${new URLSearchParams(values)}`)
      )}
      className="flex flex-wrap items-end gap-3"
    >
      <div className="space-y-1">
        <Label htmlFor="search-location">Location</Label>
        <Input
          id="search-location"
          placeholder="e.g. East Legon"
          {...form.register("location")}
        />
      </div>
      <div className="space-y-1">
        <Label htmlFor="search-budget">Maximum budget</Label>
        <Input
          id="search-budget"
          inputMode="decimal"
          placeholder="Any price"
          {...form.register("maxBudget")}
        />
      </div>
      <div className="w-24 space-y-1">
        <Label htmlFor="search-currency">Currency</Label>
        <Input id="search-currency" {...form.register("currency")} />
      </div>
      <Button variant="outline">Search</Button>
      <Button
        variant="ghost"
        type="button"
        onClick={() => {
          form.reset()
          router.push("/dashboard/properties")
        }}
      >
        Clear
      </Button>
      <p role="alert" className="w-full text-sm text-destructive">
        {Object.values(form.formState.errors)[0]?.message}
      </p>
    </form>
  )
}
