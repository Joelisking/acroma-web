import Link from "next/link"
export function LegalPage({
  title,
  children,
}: {
  title: string
  children: React.ReactNode
}) {
  return (
    <main className="mx-auto max-w-3xl px-6 py-12">
      <Link href="/" className="text-sm font-medium text-primary">
        Acroma
      </Link>
      <h1 className="mt-8 text-3xl font-semibold tracking-tight">{title}</h1>
      <p className="mt-3 text-sm text-muted-foreground">
        Dysruptive Technologies
      </p>
      <div className="mt-8 space-y-7 text-sm leading-7 text-foreground">
        {children}
      </div>
      <nav
        aria-label="Legal information"
        className="mt-12 flex gap-6 border-t pt-6 text-sm text-primary"
      >
        <Link href="/privacy">Privacy</Link>
        <Link href="/data-deletion">Data deletion</Link>
      </nav>
    </main>
  )
}
