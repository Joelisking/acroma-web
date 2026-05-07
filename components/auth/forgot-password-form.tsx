"use client";

import * as React from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { MailCheck } from "lucide-react";

import { forgotPasswordAction } from "@/lib/api/auth";
import {
  forgotPasswordSchema,
  type ForgotPasswordInput,
} from "@/lib/auth-schemas";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { AuthCta } from "@/components/auth/auth-cta";

export function ForgotPasswordForm() {
  const [pending, startTransition] = React.useTransition();
  const [sentTo, setSentTo] = React.useState<string | null>(null);

  const form = useForm<ForgotPasswordInput>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: "" },
  });

  function onSubmit(values: ForgotPasswordInput) {
    startTransition(async () => {
      const result = await forgotPasswordAction(values);
      if (!result.ok) {
        toast.error(result.error);
        return;
      }
      setSentTo(values.email);
    });
  }

  if (sentTo) return <SentState email={sentTo} />;

  return (
    <div className="space-y-8">
      <header className="space-y-3">
        <p className="eyebrow text-brand-orange">Forgot password</p>
        <h2 className="font-display text-foreground text-4xl leading-[1.05] font-medium tracking-tight">
          Send me a reset link
        </h2>
        <p className="text-muted-foreground text-sm">
          Enter the email on your Acroma account. If we recognise it, you&apos;ll
          get a link to choose a new password.
        </p>
      </header>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
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
                    placeholder="you@business.com"
                    className="h-12"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <AuthCta pending={pending}>
            {pending ? "Sending link" : "Send reset link"}
          </AuthCta>
        </form>
      </Form>
    </div>
  );
}

function SentState({ email }: { email: string }) {
  return (
    <div className="space-y-6">
      <div className="bg-brand-orange-soft text-brand-orange inline-flex size-12 items-center justify-center rounded-2xl">
        <MailCheck className="size-6" strokeWidth={1.75} aria-hidden />
      </div>
      <div className="space-y-3">
        <h2 className="font-display text-foreground text-3xl leading-[1.1] font-medium tracking-tight">
          Check your inbox
        </h2>
        <p className="text-muted-foreground text-sm">
          If an Acroma account exists for{" "}
          <span className="text-foreground font-medium">{email}</span>, we just
          sent a password-reset link. It expires in 1 hour.
        </p>
        <p className="text-muted-foreground text-xs">
          Don&apos;t see it? Check your spam folder, or try a different email
          — the one you registered with might not match.
        </p>
      </div>
      <Link
        href="/login"
        className="text-brand-orange text-sm font-medium underline-offset-4 hover:underline"
      >
        Back to sign in
      </Link>
    </div>
  );
}
