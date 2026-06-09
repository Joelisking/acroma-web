"use client";

import { type Control, type FieldPath } from "react-hook-form";

import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormDescription,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";

import type { BookingCapacityFormValues } from "./booking-capacity-form";

// ---------------------------------------------------------------------------
// CapacityNumberField
// A thin wrapper that renders a labelled numeric FormField with the shared
// empty-string -> undefined guard. Used by the parent for the two top-level
// number inputs so their FormField blocks don't bloat booking-capacity-form.
// ---------------------------------------------------------------------------

type NumberFieldName = Extract<
  FieldPath<BookingCapacityFormValues>,
  "defaultBookingCapacity" | "defaultServiceDurationMinutes"
>;

type CapacityNumberFieldProps = {
  control: Control<BookingCapacityFormValues>;
  name: NumberFieldName;
  label: React.ReactNode;
  min: number;
  max: number;
  description?: React.ReactNode;
};

export function CapacityNumberField({
  control,
  name,
  label,
  min,
  max,
  description,
}: CapacityNumberFieldProps) {
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem>
          <FormLabel>{label}</FormLabel>
          <FormControl>
            <Input
              type="number"
              inputMode="numeric"
              min={min}
              max={max}
              step={1}
              className="max-w-32"
              name={field.name}
              ref={field.ref}
              onBlur={field.onBlur}
              value={
                field.value === undefined || field.value === null
                  ? ""
                  : String(field.value)
              }
              onChange={(e) => {
                const raw = e.target.value;
                field.onChange(raw === "" ? undefined : Number(raw));
              }}
            />
          </FormControl>
          {description ? (
            <FormDescription>{description}</FormDescription>
          ) : null}
          <FormMessage />
        </FormItem>
      )}
    />
  );
}

type Props = {
  control: Control<BookingCapacityFormValues>;
  categories: string[];
};

export function CategoryCapacityFields({ control, categories }: Props) {
  return (
    <div className="space-y-3">
      <p className="text-sm font-medium">Capacity per category</p>
      {/* Fix 1 + Fix 2 + Fix 3: index-based paths keep merchant text
          out of RHF field names; FormMessage surfaces validation errors;
          max={100} enforced both in HTML and in the Zod schema above. */}
      {categories.map((cat, i) => (
        <FormField
          key={cat}
          control={control}
          name={`categoryCaps.${i}.capacity` as const}
          render={({ field }) => (
            <FormItem>
              <div className="flex items-center justify-between gap-4">
                <FormLabel className="font-normal">{cat}</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    inputMode="numeric"
                    min={1}
                    max={100}
                    step={1}
                    className="w-24"
                    name={field.name}
                    ref={field.ref}
                    onBlur={field.onBlur}
                    value={
                      field.value === undefined || field.value === null
                        ? ""
                        : String(field.value)
                    }
                    onChange={(e) => {
                      const raw = e.target.value;
                      field.onChange(
                        raw === "" ? undefined : e.target.valueAsNumber,
                      );
                    }}
                  />
                </FormControl>
              </div>
              <FormMessage />
            </FormItem>
          )}
        />
      ))}
    </div>
  );
}
