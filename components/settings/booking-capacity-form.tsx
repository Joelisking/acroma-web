"use client";

import * as React from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormDescription,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { updateBookingCapacityAction } from "@/lib/api/settings-actions";
import type { BookingCapacitySettings } from "@/lib/api/types";

// Fix 1: index-based array so merchant category text (which may contain dots)
// never appears in an RHF field path. RHF treats dots as nested-path
// separators, so "Hair.Color" in a path key silently corrupts the value.
const schema = z.object({
  bookingCapacityMode: z.enum(["SHARED", "PER_CATEGORY"]),
  defaultBookingCapacity: z
    .number({ error: "Use a number" })
    .int("Whole number")
    .min(1, "At least 1")
    .max(100, "At most 100"),
  defaultServiceDurationMinutes: z
    .number({ error: "Use a number" })
    .int("Whole number")
    .min(1, "At least 1 minute")
    .max(1440, "At most 1440"),
  categoryCaps: z.array(
    z.object({
      category: z.string(),
      capacity: z
        .number({ error: "Use a number" })
        .int("Whole number")
        .min(1, "At least 1")
        .max(100, "At most 100"),
    }),
  ),
});

type FormValues = z.infer<typeof schema>;

type Props = { initial: BookingCapacitySettings; categories: string[] };

function buildDefaultValues(
  initial: BookingCapacitySettings,
  categories: string[],
): FormValues {
  return {
    bookingCapacityMode: initial.bookingCapacityMode,
    defaultBookingCapacity: initial.defaultBookingCapacity,
    defaultServiceDurationMinutes: initial.defaultServiceDurationMinutes,
    // Only categories currently in the catalog are tracked; orphaned saved
    // keys are intentionally dropped on the next save.
    categoryCaps: categories.map((c) => ({
      category: c,
      capacity:
        initial.categoryBookingCapacities?.[c] ??
        initial.defaultBookingCapacity,
    })),
  };
}

export function BookingCapacityForm({ initial, categories }: Props) {
  const [pending, startTransition] = React.useTransition();

  // Fix 4: keep a serverValues snapshot so we can compute dirty state and
  // reset the form baseline after a successful save — matching the house
  // pattern from appointment-reminder-settings-form.tsx.
  const [serverValues, setServerValues] = React.useState<FormValues>(() =>
    buildDefaultValues(initial, categories),
  );

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: buildDefaultValues(initial, categories),
  });

  const values = useWatch({ control: form.control });

  // Dirty check mirrors the neighbour form: compare watched values against
  // the last-saved server snapshot rather than relying solely on
  // formState.isDirty (which can desync after nested array field edits).
  const dirty = React.useMemo(() => {
    if (
      values.bookingCapacityMode !== serverValues.bookingCapacityMode ||
      Number(values.defaultBookingCapacity) !==
        serverValues.defaultBookingCapacity ||
      Number(values.defaultServiceDurationMinutes) !==
        serverValues.defaultServiceDurationMinutes
    ) {
      return true;
    }
    if (
      (values.categoryCaps?.length ?? 0) !== serverValues.categoryCaps.length
    ) {
      return true;
    }
    return (values.categoryCaps ?? []).some(
      (row, i) =>
        Number(row.capacity) !== serverValues.categoryCaps[i]?.capacity,
    );
  }, [serverValues, values]);

  const mode = values.bookingCapacityMode;

  function onSubmit(submitted: FormValues) {
    startTransition(async () => {
      // Fix 1 (cont.): reconstruct the categoryBookingCapacities record from
      // the index-based array only when sending to the backend.
      const categoryBookingCapacities = Object.fromEntries(
        submitted.categoryCaps.map((row) => [row.category, row.capacity]),
      );

      const body =
        submitted.bookingCapacityMode === "PER_CATEGORY"
          ? {
              bookingCapacityMode: submitted.bookingCapacityMode,
              defaultBookingCapacity: submitted.defaultBookingCapacity,
              defaultServiceDurationMinutes:
                submitted.defaultServiceDurationMinutes,
              categoryBookingCapacities,
            }
          : {
              bookingCapacityMode: submitted.bookingCapacityMode,
              defaultBookingCapacity: submitted.defaultBookingCapacity,
              defaultServiceDurationMinutes:
                submitted.defaultServiceDurationMinutes,
            };

      const res = await updateBookingCapacityAction(body);
      if (res.ok) {
        // Fix 4: reset both the RHF baseline and the server snapshot so
        // isDirty (and our manual dirty check) return to false.
        setServerValues(submitted);
        form.reset(submitted);
        toast.success("Booking capacity saved");
      } else {
        toast.error(res.error);
      }
    });
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
        <FormField
          control={form.control}
          name="bookingCapacityMode"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Capacity mode</FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="SHARED">Shared (one pool)</SelectItem>
                  <SelectItem value="PER_CATEGORY">Per category</SelectItem>
                </SelectContent>
              </Select>
              <FormDescription>
                Shared counts every booking against one number. Per category
                gives each service category its own capacity.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="defaultBookingCapacity"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                {mode === "PER_CATEGORY"
                  ? "Default capacity (for categories you don't set)"
                  : "How many clients can you serve at once?"}
              </FormLabel>
              <FormControl>
                <Input
                  type="number"
                  inputMode="numeric"
                  min={1}
                  max={100}
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
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="defaultServiceDurationMinutes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Default appointment length (minutes)</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  inputMode="numeric"
                  min={1}
                  max={1440}
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
              <FormDescription>
                Used when a service has no set duration. Also sets how
                alternative times are spaced.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {mode === "PER_CATEGORY" && categories.length > 0 ? (
          <div className="space-y-3">
            <p className="text-sm font-medium">Capacity per category</p>
            {/* Fix 1 + Fix 2 + Fix 3: index-based paths keep merchant text
                out of RHF field names; FormMessage surfaces validation errors;
                max={100} enforced both in HTML and in the Zod schema above. */}
            {categories.map((cat, i) => (
              <FormField
                key={cat}
                control={form.control}
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
        ) : null}

        <div className="flex justify-end">
          {/* Fix 4: gate the button on pending OR !dirty to match neighbour. */}
          <Button
            type="submit"
            disabled={pending || !dirty}
            className="h-10 gap-2 rounded-xl px-5"
          >
            {pending ? <Loader2 className="size-4 animate-spin" /> : null}
            Save changes
          </Button>
        </div>
      </form>
    </Form>
  );
}
