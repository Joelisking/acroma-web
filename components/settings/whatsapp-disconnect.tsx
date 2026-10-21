"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/alert-dialog"
import { disconnectWhatsappAction } from "@/lib/api/settings-actions"

export function WhatsappDisconnect() {
  const [open, setOpen] = useState(false)
  const [pending, startTransition] = useTransition()
  const router = useRouter()
  function disconnect() {
    startTransition(async () => {
      const result = await disconnectWhatsappAction()
      if (!result.ok) {
        toast.error(result.error)
        return
      }
      setOpen(false)
      toast.success("WhatsApp disconnected")
      router.refresh()
    })
  }
  return (
    <AlertDialog
      open={open}
      onOpenChange={(value) => {
        if (!pending) setOpen(value)
      }}
    >
      <AlertDialogTrigger asChild>
        <Button variant="destructive">Disconnect WhatsApp</Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Disconnect WhatsApp?</AlertDialogTitle>
          <AlertDialogDescription>
            Acroma will stop receiving and sending messages for this number.
            Your saved chats, catalog and orders stay here. You can keep using
            WhatsApp Business on your phone and connect a number again later.
            This removes the connection from Acroma; it does not delete your
            WhatsApp account or revoke permissions in Meta.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={pending}>
            Keep connected
          </AlertDialogCancel>
          <AlertDialogAction
            variant="destructive"
            disabled={pending}
            onClick={(event) => {
              event.preventDefault()
              disconnect()
            }}
          >
            {pending ? "Disconnecting…" : "Disconnect WhatsApp"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
