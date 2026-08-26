"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";

import {
  changePasswordSchema,
  type ChangePasswordInput,
} from "@/lib/auth-schemas";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { PasswordInput } from "@/components/ui/password-input";
import { AuthCta } from "@/components/auth/auth-cta";
import { PasswordChecklist } from "@/components/auth/password-checklist";
import { completeFirstPasswordChangeAction } from "./actions";

/**
 * `forced` only changes the wording. The schema is the same either way, and
 * it already refuses a new password equal to the current one, so a worker
 * cannot keep the password they were handed.
 */
export function ChangePasswordForm({ forced }: { forced: boolean }) {
  const router = useRouter();
  const [pending, startTransition] = React.useTransition();

  const form = useForm<ChangePasswordInput>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: { currentPassword: "", newPassword: "", confirmPassword: "" },
    mode: "onChange",
  });

  const newPassword =
    useWatch({ control: form.control, name: "newPassword" }) ?? "";

  function onSubmit(values: ChangePasswordInput) {
    startTransition(async () => {
      const result = await completeFirstPasswordChangeAction({
        currentPassword: values.currentPassword,
        newPassword: values.newPassword,
      });
      if (!result.ok) {
        toast.error(result.error);
        return;
      }
      toast.success("Password updated. This one is yours alone.");
      router.replace("/dashboard/orders");
      router.refresh();
    });
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
        <FormField
          control={form.control}
          name="currentPassword"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                {forced ? "Temporary password" : "Current password"}
              </FormLabel>
              <FormControl>
                <PasswordInput
                  autoComplete="current-password"
                  placeholder={
                    forced
                      ? "The password you were given"
                      : "Your current password"
                  }
                  className="h-12"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="newPassword"
          render={({ field }) => (
            <FormItem>
              <FormLabel>New password</FormLabel>
              <FormControl>
                <PasswordInput
                  autoComplete="new-password"
                  placeholder="Create a strong password"
                  className="h-12"
                  {...field}
                />
              </FormControl>
              <PasswordChecklist value={newPassword} />
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="confirmPassword"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Confirm new password</FormLabel>
              <FormControl>
                <PasswordInput
                  autoComplete="new-password"
                  placeholder="Re-enter your new password"
                  className="h-12"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <AuthCta pending={pending}>
          {pending ? "Saving password" : "Save password"}
        </AuthCta>
      </form>
    </Form>
  );
}
