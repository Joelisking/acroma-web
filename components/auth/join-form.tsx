"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";

import { acceptInviteAction } from "@/lib/api/team-actions";
import { joinSchema, type JoinInput } from "@/lib/auth-schemas";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/password-input";
import { AuthCta } from "@/components/auth/auth-cta";
import { PasswordChecklist } from "@/components/auth/password-checklist";

/**
 * Registers the invitee. On success they are already signed in (the action
 * set the cookies), so this goes straight to the dashboard.
 */
export function JoinForm({
  token,
  businessName,
}: {
  token: string;
  businessName: string;
}) {
  const router = useRouter();
  const [pending, startTransition] = React.useTransition();

  const form = useForm<JoinInput>({
    resolver: zodResolver(joinSchema),
    defaultValues: { name: "", email: "", password: "", confirmPassword: "" },
    mode: "onChange",
  });

  const password = useWatch({ control: form.control, name: "password" }) ?? "";

  function onSubmit(values: JoinInput) {
    startTransition(async () => {
      const result = await acceptInviteAction({
        token,
        name: values.name,
        email: values.email,
        password: values.password,
      });
      if (!result.ok) {
        toast.error(result.error);
        return;
      }
      toast.success(`Welcome to ${businessName}.`);
      router.replace("/dashboard");
      router.refresh();
    });
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Your name</FormLabel>
              <FormControl>
                <Input
                  autoComplete="name"
                  placeholder="Ama Mensah"
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
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input
                  type="email"
                  autoComplete="email"
                  placeholder="you@example.com"
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
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Password</FormLabel>
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
              <FormLabel>Confirm password</FormLabel>
              <FormControl>
                <PasswordInput
                  autoComplete="new-password"
                  placeholder="Re-enter your password"
                  className="h-12"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <AuthCta pending={pending}>
          {pending ? "Joining" : `Join ${businessName}`}
        </AuthCta>
      </form>
    </Form>
  );
}
