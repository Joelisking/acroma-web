"use client";

import * as React from "react";
import { Sparkles, Loader2 } from "lucide-react";
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
import { Button } from "@/components/ui/button";
import { updateBusinessAction } from "@/lib/api/business-actions";
import type { Business } from "@/lib/api/types";
import { cn } from "@/lib/utils";

const schema = z.object({
  aiEnabled: z.boolean(),
  businessDescription: z
    .string()
    .max(300, "Keep it under 300 characters")
    .optional(),
  aiBusinessContext: z
    .string()
    .max(2000, "Keep it under 2000 characters")
    .optional(),
});

type FormValues = z.infer<typeof schema>;

export function AiForm({ business }: { business: Business }) {
  const [pending, startTransition] = React.useTransition();

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      aiEnabled: business.aiEnabled,
      businessDescription: business.businessDescription ?? "",
      aiBusinessContext: business.aiBusinessContext ?? "",
    },
  });

  const enabled = useWatch({ control: form.control, name: "aiEnabled" });

  function onSubmit(values: FormValues) {
    startTransition(async () => {
      const result = await updateBusinessAction({
        aiEnabled: values.aiEnabled,
        businessDescription: values.businessDescription || undefined,
        aiBusinessContext: values.aiBusinessContext || undefined,
      });
      if (!result.ok) toast.error(result.error);
      else toast.success("AI settings saved");
    });
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
        <FormField
          control={form.control}
          name="aiEnabled"
          render={({ field }) => (
            <FormItem
              className={cn(
                "flex items-center justify-between gap-4 rounded-2xl border p-4 transition-colors",
                enabled
                  ? "border-brand-blue/25 bg-brand-blue-soft"
                  : "border-border/70 bg-muted/40",
              )}
            >
              <div className="flex items-center gap-3">
                <span
                  className={cn(
                    "flex size-9 shrink-0 items-center justify-center rounded-xl",
                    enabled
                      ? "bg-brand-blue/15 text-brand-blue"
                      : "bg-background text-muted-foreground",
                  )}
                >
                  <Sparkles className="size-5" strokeWidth={1.75} />
                </span>
                <div>
                  <FormLabel
                    className={cn(
                      "text-sm font-medium",
                      enabled ? "text-brand-blue" : "text-foreground",
                    )}
                  >
                    AI {enabled ? "is on" : "is off"}
                  </FormLabel>
                  <FormDescription
                    className={cn(
                      "text-xs",
                      enabled && "text-brand-navy/70",
                    )}
                  >
                    {enabled
                      ? "Replies automatically until you take over."
                      : "Conversations land in your inbox without an automated reply."}
                  </FormDescription>
                </div>
              </div>
              <FormControl>
                <button
                  type="button"
                  role="switch"
                  aria-checked={field.value}
                  onClick={() => field.onChange(!field.value)}
                  className={cn(
                    "relative h-6 w-11 shrink-0 rounded-full transition-colors",
                    field.value ? "bg-brand-orange" : "bg-muted",
                  )}
                >
                  <span
                    className={cn(
                      "absolute top-0.5 left-0.5 size-5 rounded-full bg-white shadow-sm transition-transform",
                      field.value && "translate-x-5",
                    )}
                  />
                </button>
              </FormControl>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="businessDescription"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Business description</FormLabel>
              <FormControl>
                <textarea
                  rows={3}
                  className="border-input bg-background hover:bg-muted/50 focus-visible:border-ring focus-visible:ring-ring/40 placeholder:text-muted-foreground min-h-[80px] w-full resize-y rounded-md border px-3 py-2 text-sm transition-colors focus-visible:ring-2 focus-visible:outline-none"
                  placeholder="What do you sell, in one or two sentences?"
                  {...field}
                  value={field.value ?? ""}
                />
              </FormControl>
              <FormDescription>
                Helps Acroma describe your business to customers naturally.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="aiBusinessContext"
          render={({ field }) => (
            <FormItem>
              <FormLabel>AI context</FormLabel>
              <FormControl>
                <textarea
                  rows={6}
                  className="border-input bg-background hover:bg-muted/50 focus-visible:border-ring focus-visible:ring-ring/40 placeholder:text-muted-foreground min-h-[140px] w-full resize-y rounded-md border px-3 py-2 text-sm leading-relaxed transition-colors focus-visible:ring-2 focus-visible:outline-none"
                  placeholder="The instruction Acroma uses when replying. Generated during onboarding — edit any time to fine-tune the AI's voice."
                  {...field}
                  value={field.value ?? ""}
                />
              </FormControl>
              <FormDescription>
                Acroma generated this from your business type and description.
                You can rewrite it any time.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end">
          <Button
            type="submit"
            disabled={pending}
            className="h-10 gap-2 rounded-xl px-5"
          >
            {pending ? <Loader2 className="animate-spin" /> : null}
            Save changes
          </Button>
        </div>
      </form>
    </Form>
  );
}
