"use client"
import { startTransition } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
export function EstateError({ reset }: { reset: () => void }) {
  const router = useRouter()
  return (
    <div
      role="alert"
      className="mx-auto max-w-lg space-y-4 rounded-xl border p-8"
    >
      <h2 className="text-xl font-semibold">We couldn&apos;t load this page</h2>
      <p className="text-muted-foreground">
        Please try again. If the issue continues, check your connection.
      </p>
      <Button
        onClick={() =>
          startTransition(() => {
            router.refresh()
            reset()
          })
        }
      >
        Try again
      </Button>
    </div>
  )
}
