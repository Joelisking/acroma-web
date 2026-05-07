"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";

import { resetPasswordAction } from "@/lib/api/auth";
import {
  resetPasswordSchema,
  type ResetPasswordInput,
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

type ResetPasswordFormProps = {
  token: string;
  email: string;
};

export function ResetPasswordForm({ token, email }: ResetPasswordFormProps) {
  const router = useRouter();
  const [pending, startTransition] = React.useTransition();

  const form = useForm<ResetPasswordInput>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { password: "", confirmPassword: "" },
    mode: "onChange",
  });

  const password = useWatch({ control: form.control, name: "password" }) ?? "";

  function onSubmit(values: ResetPasswordInput) {
    startTransition(async () => {
      const result = await resetPasswordAction({
        token,
        email,
        password: values.password,
      });
      if (!result.ok) {
        toast.error(result.error);
        return;
      }
      toast.success("Password updated. Sign in with your new password.");
      router.replace("/login");
    });
  }

  return (
    <div className="space-y-8">
      <header className="space-y-3">
        <p className="eyebrow text-brand-orange">Reset password</p>
        <h2 className="font-display text-foreground text-4xl leading-[1.05] font-medium tracking-tight">
          Choose a new password
        </h2>
        <p className="text-muted-foreground text-sm">
          Resetting for{" "}
          <span className="text-foreground font-medium">{email}</span>.
        </p>
      </header>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
          <FormField
            control={form.control}
            name="password"
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
                <PasswordChecklist value={password} />
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
            {pending ? "Updating password" : "Update password"}
          </AuthCta>
        </form>
      </Form>
    </div>
  );
}
