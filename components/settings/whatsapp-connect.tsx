"use client"
import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { useWhatsappSignup } from "@/hooks/use-whatsapp-signup"
export function WhatsappConnect() {
  const signup = useWhatsappSignup()
  const [pin, setPin] = useState("")
  // Most merchants already sell from the WhatsApp Business app, so keeping
  // the app (Meta coexistence) is the default.
  const [keepBusinessApp, setKeepBusinessApp] = useState(true)
  const connected = signup.progress?.status === "CONNECTED"
  return (
    <section className="space-y-5" aria-label="Connect WhatsApp">
      <p className="text-sm text-muted-foreground">
        Choose the WhatsApp account and number you want Acroma to use. Keep your
        Meta login details private.
      </p>
      {signup.progress && (
        <p role="status" className="text-sm">
          {signup.progress.message}
        </p>
      )}
      {signup.error && (
        <p role="alert" className="text-sm text-destructive">
          {signup.error}
        </p>
      )}
      {connected ? (
        <div className="space-y-3">
          <p className="text-sm">
            Check your payment method in WhatsApp Manager before sending paid
            messages.
          </p>
          <Button asChild>
            <Link href="/dashboard/settings/whatsapp">
              Return to WhatsApp settings
            </Link>
          </Button>
        </div>
      ) : (
        <div className="flex flex-wrap gap-3">
          <Button
            onClick={() => void signup.prepare()}
            disabled={signup.busy}
            variant={signup.attempt ? "outline" : "default"}
          >
            {signup.busy
              ? "Preparing…"
              : signup.attempt
                ? "Prepare a new connection"
                : "Prepare or resume connection"}
          </Button>
          {signup.attempt && !signup.progress && (
            <Button onClick={() => signup.launch(keepBusinessApp)}>
              Continue with Meta
            </Button>
          )}
        </div>
      )}
      {!connected && !signup.progress && (
        <div className="max-w-xl space-y-2 rounded-lg border p-4">
          <div className="flex items-center justify-between gap-4">
            <Label htmlFor="whatsapp-keep-business-app">
              This number already uses the WhatsApp Business app
            </Label>
            <Switch
              id="whatsapp-keep-business-app"
              checked={keepBusinessApp}
              onCheckedChange={setKeepBusinessApp}
            />
          </div>
          <p className="text-xs text-muted-foreground">
            {keepBusinessApp
              ? "Keep using the app on your phone. Meta will show a QR code to scan with it. Replies you send from the app appear here and pause Acroma on that chat. Broadcast lists in the app stop working."
              : "For a number that is not on WhatsApp yet. Meta will verify it by SMS or call."}
          </p>
        </div>
      )}
      {signup.progress?.status === "ACTION_REQUIRED" &&
        !signup.progress.needsPin && (
          <Button
            disabled={signup.busy}
            onClick={() => void signup.submitPin()}
          >
            Resume existing setup
          </Button>
        )}
      {signup.progress?.needsPin && (
        <form
          className="max-w-sm space-y-3"
          onSubmit={(event) => {
            event.preventDefault()
            void signup.submitPin(pin)
            setPin("")
          }}
        >
          <Label htmlFor="whatsapp-registration-pin">
            Choose a six-digit WhatsApp registration PIN
          </Label>
          <Input
            id="whatsapp-registration-pin"
            type="password"
            inputMode="numeric"
            autoComplete="new-password"
            maxLength={6}
            pattern="[0-9]{6}"
            required
            value={pin}
            onChange={(event) => setPin(event.target.value)}
          />
          <p className="text-xs text-muted-foreground">
            Keep this PIN in your password manager. It protects your WhatsApp
            registration.
          </p>
          <Button type="submit" disabled={signup.busy || !/^\d{6}$/.test(pin)}>
            Finish connecting
          </Button>
        </form>
      )}
    </section>
  )
}
