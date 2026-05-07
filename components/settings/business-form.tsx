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
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { CURRENCIES, COUNTRIES } from "@/lib/locale";
import { updateBusinessAction } from "@/lib/api/business-actions";
import { ImageUploader } from "@/components/shared/image-uploader";

const schema = z.object({
  name: z.string().min(2, "Too short").max(80),
  currency: z.string().min(3),
  country: z.string().min(2),
  logoUrl: z.string().url("Must be a URL").or(z.literal("")).optional(),
});

type Defaults = z.infer<typeof schema>;

export function BusinessForm({ defaults }: { defaults: Defaults }) {
  const [pending, startTransition] = React.useTransition();

  const form = useForm<Defaults>({
    resolver: zodResolver(schema),
    defaultValues: defaults,
  });

  function onSubmit(values: Defaults) {
    startTransition(async () => {
      const result = await updateBusinessAction({
        ...values,
        logoUrl: values.logoUrl || undefined,
      });
      if (!result.ok) toast.error(result.error);
      else toast.success("Business profile updated");
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
              <FormLabel>Business name</FormLabel>
              <FormControl>
                <Input className="h-11" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid gap-5 sm:grid-cols-2">
          <FormField
            control={form.control}
            name="currency"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Currency</FormLabel>
                <FormControl>
                  <SelectInput
                    options={[...CURRENCIES]}
                    value={field.value}
                    onChange={field.onChange}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="country"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Country</FormLabel>
                <FormControl>
                  <SelectInput
                    options={[...COUNTRIES]}
                    value={field.value}
                    onChange={field.onChange}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="logoUrl"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Logo</FormLabel>
              <FormControl>
                <div className="max-w-[200px]">
                  <ImageUploader
                    value={field.value || null}
                    onChange={(url) => field.onChange(url ?? "")}
                    kind="logo"
                    aspect="aspect-square"
                  />
                </div>
              </FormControl>
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

function SelectInput({
  options,
  value,
  onChange,
}: {
  options: { value: string; label: string }[];
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="border-input bg-background hover:bg-muted/50 focus-visible:border-ring focus-visible:ring-ring/40 h-11 w-full rounded-md border px-3 text-sm transition-colors focus-visible:ring-2 focus-visible:outline-none"
    >
      {options.map((o) => (
        <option key={o.value} value={o.value}>
          {o.label}
        </option>
      ))}
    </select>
  );
}
