"use client"

import Link from "next/link"
import { Checkbox } from "@/components/ui/checkbox"
import { LEGAL_POLICY_VERSION } from "@/lib/legal-policy"
import * as React from "react"
import { useRouter } from "next/navigation"
import { useForm, useWatch } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { toast } from "sonner"

import { registerAction } from "@/lib/api/auth"
import { registerSchema, type RegisterInput } from "@/lib/auth-schemas"
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { PasswordInput } from "@/components/ui/password-input"
import { AuthCta } from "@/components/auth/auth-cta"
import { PasswordChecklist } from "@/components/auth/password-checklist"

export function RegisterForm() {
  const router = useRouter()
  const [pending, startTransition] = React.useTransition()

  const form = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
      acceptedLegal: false,
    },
    mode: "onChange",
  })

  const password = useWatch({ control: form.control, name: "password" }) ?? ""

  function onSubmit(values: RegisterInput) {
    startTransition(async () => {
      const result = await registerAction({
        name: values.name,
        email: values.email,
        password: values.password,
        acceptedLegal: values.acceptedLegal,
        legalPolicyVersion: LEGAL_POLICY_VERSION,
      })
      if (!result.ok) {
        toast.error(result.error)
        return
      }
      toast.success("Account created. Let's get you set up.")
      router.replace("/dashboard")
      router.refresh()
    })
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Business name</FormLabel>
              <FormControl>
                <Input
                  autoComplete="organization"
                  placeholder="Auntie Adwoa's Kitchen"
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

        <FormField
          control={form.control}
          name="acceptedLegal"
          render={({ field }) => (
            <FormItem>
              <div className="flex items-start gap-3">
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={(checked) =>
                      field.onChange(checked === true)
                    }
                    onBlur={field.onBlur}
                    ref={field.ref}
                    disabled={pending}
                    aria-label="Agree to the Privacy Policy and Terms of Use"
                    className="mt-1"
                  />
                </FormControl>
                <FormLabel className="block text-sm leading-6 font-normal">
                  I agree to the{" "}
                  <Link
                    className="text-primary underline"
                    href="/privacy"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Privacy Policy
                  </Link>{" "}
                  and{" "}
                  <Link
                    className="text-primary underline"
                    href="/terms"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Terms of Use
                  </Link>
                  .
                </FormLabel>
              </div>
              <FormMessage />
            </FormItem>
          )}
        />
        <p className="text-xs leading-5 text-muted-foreground">
          Chats are used to operate and improve Acroma. Our Privacy Policy
          explains these uses and possible future model training, subject to
          applicable permissions and restrictions.
        </p>

        <AuthCta pending={pending}>
          {pending ? "Creating account" : "Create account"}
        </AuthCta>
      </form>
    </Form>
  )
}
