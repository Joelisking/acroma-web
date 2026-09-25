export default function Loading() {
  return (
    <main className="mx-auto max-w-2xl space-y-4 px-6 py-12" role="status">
      <p>Loading WhatsApp setup…</p>
      <div className="h-32 animate-pulse rounded-xl bg-muted" />
    </main>
  )
}
