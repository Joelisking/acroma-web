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
import { updateReminderSettingsAction } from "@/lib/api/settings-actions";
import type { ReminderSettings } from "@/lib/api/types";

// Bounds mirror the backend DTO (UpdateReminderSettingsDto). Minute fields
// are 1–1440 (24 h cap — reminders fully stop after 24 h of customer
// silence anyway). maxReminders is bounded 1–10.
const minuteField = z
  .number({ error: "Use a number" })
  .int("Use a whole number")
  .min(1, "At least 1 minute")
  .max(1440, "At most 1440 (24 h)");

const schema = z.object({
  reminderFirstMinutes: minuteField,
  reminderSecondMinutes: minuteField,
  reminderThirdMinutes: minuteField,
  autoTakeoverMinutes: minuteField,
  maxReminders: z
    .number({ error: "Use a number" })
    .int("Use a whole number")
    .min(1, "At least 1")
    .max(10, "At most 10"),
});

type FormValues = z.infer<typeof schema>;

type ReminderSettingsFormProps = {
  initial: ReminderSettings;
};

const FIELDS: ReadonlyArray<{
  name: keyof FormValues;
  label: string;
  description: string;
  unit: "minutes" | "count";
}> = [
  {
    name: "reminderFirstMinutes",
    label: "First reminder",
    description:
      "How many minutes after an escalation to send the first reminder.",
    unit: "minutes",
  },
  {
    name: "reminderSecondMinutes",
    label: "Second reminder",
    description: "How many minutes after the first reminder to send a second.",
    unit: "minutes",
  },
  {
    name: "reminderThirdMinutes",
    label: "Third reminder",
    description: "How many minutes after the second reminder to send a third.",
    unit: "minutes",
  },
  {
    name: "autoTakeoverMinutes",
    label: "AI takes back over",
    description:
      "How many minutes after the original escalation before Acroma steps in to hold the line.",
    unit: "minutes",
  },
  {
    name: "maxReminders",
    label: "Maximum reminders",
    description:
      "Cap on how many reminders fire per conversation, before or after auto-takeover. 1 to 10.",
    unit: "count",
  },
];

export function ReminderSettingsForm({ initial }: ReminderSettingsFormProps) {
  const [pending, startTransition] = React.useTransition();
  const [serverValues, setServerValues] =
    React.useState<ReminderSettings>(initial);

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: initial,
  });

  const values = useWatch({ control: form.control });
  const dirty = React.useMemo(
    () =>
      (Object.keys(serverValues) as (keyof ReminderSettings)[]).some(
        (k) => Number(values?.[k]) !== serverValues[k],
      ),
    [serverValues, values],
  );

  function onSubmit(submitted: FormValues) {
    startTransition(async () => {
      const result = await updateReminderSettingsAction(submitted);
      if (!result.ok) {
        toast.error(result.error);
        return;
      }
      setServerValues(result.data);
      form.reset(result.data);
      toast.success("Reminder cadence saved");
    });
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {FIELDS.map((f) => (
            <FormField
              key={f.name}
              control={form.control}
              name={f.name}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{f.label}</FormLabel>
                  <FormControl>
                    <div className="flex items-center gap-2">
                      <Input
                        type="number"
                        inputMode="numeric"
                        min={1}
                        max={f.unit === "count" ? 10 : 1440}
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
                          // Empty string → undefined so zod's "Use a number"
                          // shows up. Otherwise hand a real number to the
                          // form state so the resolver gets the typed value.
                          field.onChange(
                            raw === "" ? undefined : Number(raw),
                          );
                        }}
                      />
                      <span className="text-muted-foreground text-xs">
                        {f.unit === "minutes" ? "minutes" : "reminders"}
                      </span>
                    </div>
                  </FormControl>
                  <FormDescription>{f.description}</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          ))}
        </div>

        <div className="flex justify-end">
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
