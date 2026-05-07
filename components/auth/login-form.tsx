"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";

import { loginAction } from "@/lib/api/auth";
import { loginSchema, type LoginInput } from "@/lib/auth-schemas";
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

export function LoginForm() {
  const router = useRouter();
  const [pending, startTransition] = React.useTransition();

  const form = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  function onSubmit(values: LoginInput) {
    startTransition(async () => {
      const result = await loginAction(values);
      if (!result.ok) {
        toast.error(result.error);
        return;
      }
      toast.success(`Welcome back, ${result.data.business.name.split(" ")[0]}`);
      router.replace("/dashboard");
      router.refresh();
    });
  }

  return (
    <div className="space-y-8">
      <header className="space-y-3">
        <p className="eyebrow text-brand-orange">Welcome back</p>
        <h2 className="font-display text-foreground text-4xl leading-[1.05] font-medium tracking-tight">
          Sign in to your dashboard
        </h2>
        <p className="text-muted-foreground text-sm">
          Pick up exactly where you left off. Your conversations, orders, and
          payments are all live.
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
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <div className="flex items-center justify-between">
                  <FormLabel>Password</FormLabel>
                  <Link
                    href="#"
                    className="text-muted-foreground hover:text-brand-orange text-xs underline-offset-4 hover:underline"
                    tabIndex={-1}
                  >
                    Forgot?
                  </Link>
                </div>
                <FormControl>
                  <PasswordInput
                    autoComplete="current-password"
                    placeholder="••••••••"
                    className="h-12"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <AuthCta pending={pending}>
            {pending ? "Signing in" : "Sign in"}
          </AuthCta>
        </form>
      </Form>
    </div>
  );
}
