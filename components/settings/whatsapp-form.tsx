"use client";

import * as React from "react";
import Link from "next/link";
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
import { updateWhatsappAction } from "@/lib/api/settings-actions";

const schema = z.object({
  phoneNumberId: z.string().min(3, "Required"),
  accessToken: z.string().min(20, "Looks too short"),
  businessAccountId: z.string().min(3, "Required"),
});

type WhatsappFormProps = {
  defaults: {
    phoneNumberId: string | null;
    businessAccountId: string | null;
  };
};

export function WhatsappForm({ defaults }: WhatsappFormProps) {
  const [pending, startTransition] = React.useTransition();

  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: {
      phoneNumberId: defaults.phoneNumberId ?? "",
      accessToken: "",
      businessAccountId: defaults.businessAccountId ?? "",
    },
  });

  function onSubmit(values: z.infer<typeof schema>) {
    startTransition(async () => {
      const result = await updateWhatsappAction(values);
      if (!result.ok) toast.error(result.error);
      else {
        toast.success("WhatsApp credentials saved");
        form.reset({ ...values, accessToken: "" });
      }
    });
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
        <FormField
          control={form.control}
          name="phoneNumberId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Phone number ID</FormLabel>
              <FormControl>
                <Input className="h-11 font-mono text-xs" {...field} />
              </FormControl>
              <FormDescription>
                In your Meta App → <strong>WhatsApp → API setup</strong>.{" "}
                <Link
                  href="/dashboard/settings/whatsapp/guide"
                  className="text-brand-orange underline-offset-4 hover:underline"
                >
                  Where do I find this?
                </Link>
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="businessAccountId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>WhatsApp Business Account ID</FormLabel>
              <FormControl>
                <Input className="h-11 font-mono text-xs" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="accessToken"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Access token</FormLabel>
              <FormControl>
                <PasswordInput
                  autoComplete="off"
                  placeholder="Paste a permanent access token"
                  className="h-11 font-mono text-xs"
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
