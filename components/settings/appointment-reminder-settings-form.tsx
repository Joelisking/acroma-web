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

const schema = z.object({
  appointmentReminderHours: z
    .number({ error: "Use a number" })
    .int("Use a whole number")
    .min(1, "At least 1 hour")
    .max(168, "At most 168 (7 days)"),
  appointmentReminderTemplateName: z.string(),
});

type FormValues = z.infer<typeof schema>;

type AppointmentReminderSettingsFormProps = {
  initial: Pick<
    ReminderSettings,
    "appointmentReminderHours" | "appointmentReminderTemplateName"
  >;
};

export function AppointmentReminderSettingsForm({
  initial,
}: AppointmentReminderSettingsFormProps) {
  const [pending, startTransition] = React.useTransition();
  const [serverValues, setServerValues] = React.useState({
    appointmentReminderHours: initial.appointmentReminderHours,
    appointmentReminderTemplateName:
      initial.appointmentReminderTemplateName ?? "",
  });

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      appointmentReminderHours: initial.appointmentReminderHours,
      appointmentReminderTemplateName:
        initial.appointmentReminderTemplateName ?? "",
    },
  });

  const values = useWatch({ control: form.control });
  const dirty = React.useMemo(
    () =>
      Number(values.appointmentReminderHours) !==
        serverValues.appointmentReminderHours ||
      (values.appointmentReminderTemplateName ?? "") !==
        serverValues.appointmentReminderTemplateName,
    [serverValues, values],
  );

  function onSubmit(submitted: FormValues) {
    startTransition(async () => {
      const result = await updateReminderSettingsAction({
        appointmentReminderHours: submitted.appointmentReminderHours,
        appointmentReminderTemplateName:
          submitted.appointmentReminderTemplateName.trim(),
      });
      if (!result.ok) {
        toast.error(result.error);
        return;
      }
      const next = {
        appointmentReminderHours: result.data.appointmentReminderHours,
        appointmentReminderTemplateName:
          result.data.appointmentReminderTemplateName ?? "",
      };
      setServerValues(next);
      form.reset(next);
      toast.success("Appointment reminder settings saved");
    });
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <FormField
            control={form.control}
            name="appointmentReminderHours"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Hours before appointment to remind</FormLabel>
                <FormControl>
                  <div className="flex items-center gap-2">
                    <Input
                      type="number"
                      inputMode="numeric"
                      min={1}
                      max={168}
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
                    <span className="text-muted-foreground text-xs">hours</span>
                  </div>
                </FormControl>
                <FormDescription>
                  How many hours before the booking to send the reminder
                  message. 1 to 168 (7 days).
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="appointmentReminderTemplateName"
            render={({ field }) => (
              <FormItem className="sm:col-span-2">
                <FormLabel>WhatsApp template name (optional)</FormLabel>
                <FormControl>
                  <Input
                    type="text"
                    placeholder="e.g. appointment_reminder"
                    className="max-w-sm"
                    {...field}
                  />
                </FormControl>
                <FormDescription>
                  Needed to reach customers who messaged more than 24 hours
                  ago. Leave blank to remind only customers active in the last
                  24 hours. The template must be approved in WhatsApp.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
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
