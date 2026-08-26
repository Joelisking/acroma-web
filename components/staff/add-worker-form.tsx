"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { toast } from "sonner"
import { Loader2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { DialogFooter } from "@/components/ui/dialog"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { createStaffAction } from "@/lib/api/staff-actions"
import type { CreatedStaff } from "@/lib/api/types"

import { USERNAME_HINT, USERNAME_PATTERN, suggestUsername } from "./username"

const schema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Enter the worker's name")
    .max(80, "That name is too long"),
  username: z.string().regex(USERNAME_PATTERN, USERNAME_HINT),
})

type AddWorkerInput = z.infer<typeof schema>

type Props = {
  businessName: string
  onCreated: (staff: CreatedStaff) => void
  onCancel: () => void
}

export function AddWorkerForm({ businessName, onCreated, onCancel }: Props) {
  const router = useRouter()
  const [pending, startTransition] = React.useTransition()
  const edited = React.useRef(false)

  const form = useForm<AddWorkerInput>({
    resolver: zodResolver(schema),
    defaultValues: { name: "", username: "" },
  })

  /** Keep the username in step with the name until the owner edits it. */
  function onNameChange(value: string) {
    form.setValue("name", value, { shouldValidate: form.formState.isSubmitted })
    if (edited.current) return
    form.setValue("username", suggestUsername(businessName, value), {
      shouldValidate: form.formState.isSubmitted,
    })
  }

  function onSubmit(values: AddWorkerInput) {
    startTransition(async () => {
      const result = await createStaffAction(values)
      if (!result.ok) {
        // Usernames are unique across every business, so a clash is the one
        // failure the owner can fix right here on the field.
        if (/username/i.test(result.error)) {
          form.setError("username", { message: result.error })
        } else {
          toast.error(result.error)
        }
        return
      }
      router.refresh()
      onCreated(result.data)
    })
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input
                  autoFocus
                  autoComplete="off"
                  placeholder="Ama Mensah"
                  className="h-11"
                  {...field}
                  onChange={(e) => onNameChange(e.target.value)}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="username"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Username</FormLabel>
              <FormControl>
                <Input
                  autoComplete="off"
                  autoCapitalize="none"
                  spellCheck={false}
                  placeholder="your-business-ama"
                  className="h-11 font-mono"
                  {...field}
                  onChange={(e) => {
                    edited.current = true
                    field.onChange(e.target.value.toLowerCase())
                  }}
                />
              </FormControl>
              <FormDescription>
                This is what they type to sign in. Usernames are shared across
                all of Acroma, so we start it with your business name to keep it
                free. {USERNAME_HINT}
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            disabled={pending}
            onClick={onCancel}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={pending} className="gap-2">
            {pending ? <Loader2 className="animate-spin" /> : null}
            Add worker
          </Button>
        </DialogFooter>
      </form>
    </Form>
  )
}
