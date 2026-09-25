"use client"
import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useWhatsappSignup } from "@/hooks/use-whatsapp-signup"
export function WhatsappConnect() {
  const signup = useWhatsappSignup()
  const [pin, setPin] = useState("")
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
            <Button onClick={signup.launch}>Continue with Meta</Button>
          )}
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
