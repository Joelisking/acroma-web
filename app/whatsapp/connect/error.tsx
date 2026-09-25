"use client"
import { Button } from "@/components/ui/button"
export default function Error({ reset }: { error: Error; reset: () => void }) {
  return (
    <main className="mx-auto max-w-2xl space-y-4 px-6 py-12">
      <h1 className="text-xl font-semibold">Could not load WhatsApp setup</h1>
      <p>Check your connection and try again.</p>
      <Button onClick={reset}>Try again</Button>
    </main>
  )
}
