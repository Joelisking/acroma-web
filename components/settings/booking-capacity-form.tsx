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
  categoryBookingCapacities: z.record(z.string(), z.number().int().min(1)),
});

type FormValues = z.infer<typeof schema>;

type Props = { initial: BookingCapacitySettings; categories: string[] };

export function BookingCapacityForm({ initial, categories }: Props) {
  const [pending, startTransition] = React.useTransition();

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      bookingCapacityMode: initial.bookingCapacityMode,
      defaultBookingCapacity: initial.defaultBookingCapacity,
      defaultServiceDurationMinutes: initial.defaultServiceDurationMinutes,
      categoryBookingCapacities: Object.fromEntries(
        categories.map((c) => [
          c,
          initial.categoryBookingCapacities?.[c] ??
            initial.defaultBookingCapacity,
        ]),
      ),
    },
  });

  const mode = useWatch({ control: form.control, name: "bookingCapacityMode" });

  function onSubmit(values: FormValues) {
    startTransition(async () => {
      const body =
        values.bookingCapacityMode === "PER_CATEGORY"
          ? values
          : {
              bookingCapacityMode: values.bookingCapacityMode,
              defaultBookingCapacity: values.defaultBookingCapacity,
              defaultServiceDurationMinutes:
                values.defaultServiceDurationMinutes,
            };
      const res = await updateBookingCapacityAction(body);
      if (res.ok) {
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
            {categories.map((cat) => (
              <FormField
                key={cat}
                control={form.control}
                name={`categoryBookingCapacities.${cat}` as const}
                render={({ field }) => (
                  <FormItem className="flex items-center justify-between gap-4">
                    <FormLabel className="font-normal">{cat}</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        inputMode="numeric"
                        min={1}
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
                          field.onChange(raw === "" ? undefined : Number(raw));
                        }}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
            ))}
          </div>
        ) : null}

        <div className="flex justify-end">
          <Button
            type="submit"
            disabled={pending}
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
