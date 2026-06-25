import { SectionNav } from "@/components/settings/section-nav";

export default function SettingsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <header>
        <h1 className="text-foreground text-2xl font-semibold tracking-tight sm:text-3xl">
          Settings
        </h1>
        <p className="text-muted-foreground mt-1 text-sm">
          Connect channels, configure payments, and tune Acroma to your business.
        </p>
      </header>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[200px_minmax(0,1fr)]">
        <aside className="min-w-0 lg:sticky lg:top-24 lg:self-start">
          <SectionNav />
        </aside>
        <div className="min-w-0">{children}</div>
      </div>
    </div>
  );
}
