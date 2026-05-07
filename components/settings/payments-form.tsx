"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

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
import { PasswordInput } from "@/components/ui/password-input";
import { Button } from "@/components/ui/button";
import { updatePaystackAction } from "@/lib/api/settings-actions";

const schema = z.object({
  publicKey: z.string().min(8, "Too short"),
  secretKey: z
    .string()
    .min(8, "Too short")
    .or(z.literal(""))
    .optional(),
});

type Defaults = z.infer<typeof schema>;

export function PaymentsForm({
  defaults,
}: {
  defaults: { publicKey: string };
}) {
  const [pending, startTransition] = React.useTransition();

  const form = useForm<Defaults>({
    resolver: zodResolver(schema),
    defaultValues: { publicKey: defaults.publicKey, secretKey: "" },
  });

  function onSubmit(values: Defaults) {
    startTransition(async () => {
      const result = await updatePaystackAction({
        publicKey: values.publicKey,
        secretKey: values.secretKey || undefined,
      });
      if (!result.ok) toast.error(result.error);
      else {
        toast.success("Paystack credentials saved");
        form.reset({ ...values, secretKey: "" });
      }
    });
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
        <FormField
          control={form.control}
          name="publicKey"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Public key</FormLabel>
              <FormControl>
                <Input
                  className="h-11 font-mono text-xs"
                  placeholder="pk_live_…"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="secretKey"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Secret key</FormLabel>
              <FormControl>
                <PasswordInput
                  autoComplete="off"
                  className="h-11 font-mono text-xs"
                  placeholder="sk_live_… (leave empty to keep existing)"
                  {...field}
                />
              </FormControl>
              <FormDescription>
                Stored encrypted at rest. Re-paste any time you rotate it.
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
            Save credentials
          </Button>
        </div>
      </form>
    </Form>
  );
}
