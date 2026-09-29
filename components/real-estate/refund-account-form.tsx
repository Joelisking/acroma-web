"use client"
import { useState } from "react"
import { Controller, useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { toast } from "sonner"
import { refundAccountInput, type RefundBank } from "@/lib/estate-refunds"
import {
  confirmEstateRefundAccount,
  estateRefundAccount,
  estateRefundBanks,
} from "@/lib/api/estate-refund-actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

export function RefundAccountForm({
  appointmentId,
}: {
  appointmentId: string
}) {
  const [banks, setBanks] = useState<RefundBank[] | null>(null)
  const [name, setName] = useState("")
  const [pending, setPending] = useState(false)
  const form = useForm<z.infer<typeof refundAccountInput>>({
    resolver: zodResolver(refundAccountInput),
    defaultValues: { bankId: "", accountNumber: "" },
  })
  if (!banks)
    return (
      <Button
        variant="outline"
        disabled={pending}
        onClick={async () => {
          setPending(true)
          const result = await estateRefundBanks(appointmentId)
          setPending(false)
          if (result.ok) setBanks(result.value)
          else toast.error(result.error)
        }}
      >
        {pending ? "Loading banks…" : "Add customer bank details"}
      </Button>
    )
  return (
    <form
      className="space-y-3 rounded-lg border p-3"
      onSubmit={form.handleSubmit(async (values) => {
        setName("")
        const result = await estateRefundAccount(appointmentId, values)
        if (result.ok) setName(result.value.accountName)
        else toast.error(result.error)
      })}
    >
      <p className="text-sm">Use a bank account belonging to this customer.</p>
      <div className="space-y-2">
        <Label htmlFor="refund-bank">Customer’s bank</Label>
        <Controller
          control={form.control}
          name="bankId"
          render={({ field }) => (
            <Select
              value={field.value}
              onValueChange={(value) => {
                field.onChange(value)
                setName("")
              }}
              disabled={pending || form.formState.isSubmitting}
            >
              <SelectTrigger id="refund-bank" className="w-full">
                <SelectValue placeholder="Choose a bank" />
              </SelectTrigger>
              <SelectContent>
                {banks.map((bank) => (
                  <SelectItem key={bank.id} value={bank.id}>
                    {bank.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="refund-account-number">Customer’s account number</Label>
        <Input
          id="refund-account-number"
          inputMode="numeric"
          autoComplete="off"
          disabled={pending || form.formState.isSubmitting}
          {...form.register("accountNumber", { onChange: () => setName("") })}
        />
      </div>
      <p role="alert" className="text-sm text-destructive">
        {Object.values(form.formState.errors)[0]?.message}
      </p>
      <Button
        type="submit"
        size="sm"
        variant="outline"
        disabled={pending || form.formState.isSubmitting}
      >
        Check account
      </Button>
      {name && (
        <div className="space-y-3">
          <p className="text-sm">
            Account name: <strong>{name}</strong>. Confirm this is the
            customer’s account before continuing.
          </p>
          <Button
            type="button"
            size="sm"
            disabled={pending}
            onClick={async () => {
              setPending(true)
              const result = await confirmEstateRefundAccount(appointmentId, {
                ...form.getValues(),
                expectedAccountName: name,
              })
              setPending(false)
              if (!result.ok) toast.error(result.error)
              else
                toast.info(
                  "Refund details submitted. Check its status for confirmation."
                )
            }}
          >
            {pending ? "Submitting…" : "Confirm customer account"}
          </Button>
        </div>
      )}
    </form>
  )
}
