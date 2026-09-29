"use client"

import { useEffect } from "react"
import { Button } from "@/components/ui/button"
import { StaleDeployNotice } from "@/components/stale-deploy-notice"
import { useStaleDeployReload } from "@/hooks/use-stale-deploy-reload"

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  const stale = useStaleDeployReload(error)
  useEffect(() => {
    console.error(error)
  }, [error])
  if (stale) return <StaleDeployNotice />

  return (
    <div className="card-warm p-6 text-center">
      <p className="text-xs font-bold tracking-widest text-brand-orange uppercase">
        Couldn&apos;t load
      </p>
      <h2 className="mt-3 text-xl font-bold tracking-tight">
        Workers unavailable
      </h2>
      <p className="mt-2 text-sm text-muted-foreground">
        {error.message || "Try again."}
      </p>
      <Button onClick={() => reset()} className="mt-5 rounded-xl">
        Try again
      </Button>
    </div>
  )
}
