"use client"
import { Controller, type UseFormReturn } from "react-hook-form"
import { z } from "zod"
import { bookingInput, type Listing } from "@/lib/real-estate"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
type Details = Omit<z.infer<typeof bookingInput>, "requestKey">
export function AppointmentSelectors({
  form,
  properties,
  kind,
  onChange,
}: {
  form: UseFormReturn<Details>
  properties: Listing[]
  kind: Details["kind"]
  onChange: () => void
}) {
  return (
    <>
      <div className="space-y-2">
        <Label htmlFor="appointment-kind">Appointment type</Label>
        <Controller
          control={form.control}
          name="kind"
          render={({ field }) => (
            <Select
              value={field.value}
              onValueChange={(value) => {
                field.onChange(value)
                form.setValue("propertyId", undefined)
                onChange()
              }}
            >
              <SelectTrigger id="appointment-kind">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="CONSULTATION">Consultation</SelectItem>
                <SelectItem value="VIEWING">Property viewing</SelectItem>
              </SelectContent>
            </Select>
          )}
        />
      </div>
      {kind === "VIEWING" && (
        <div className="space-y-2">
          <Label htmlFor="viewing-property">Property</Label>
          <Controller
            control={form.control}
            name="propertyId"
            render={({ field }) => (
              <Select
                value={field.value ?? ""}
                onValueChange={(value) => {
                  field.onChange(value)
                  onChange()
                }}
              >
                <SelectTrigger id="viewing-property">
                  <SelectValue placeholder="Choose a property" />
                </SelectTrigger>
                <SelectContent>
                  {properties
                    .filter((p) => p.status === "AVAILABLE")
                    .map((p) => (
                      <SelectItem key={p.id} value={p.id}>
                        {p.title} · {p.location}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            )}
          />
        </div>
      )}
    </>
  )
}
