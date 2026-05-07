import { SectionNav } from "@/components/settings/section-nav";

export default function SettingsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <header>
        <p className="eyebrow text-muted-foreground">Settings</p>
        <h1 className="font-display text-foreground mt-1 text-3xl font-medium tracking-tight">
          Workspace
        </h1>
        <p className="text-muted-foreground mt-1 text-sm">
          Connect channels, configure payments, and tune Acroma to your business.
        </p>
      </header>

      <div className="grid gap-6 lg:grid-cols-[200px_minmax(0,1fr)]">
        <aside className="lg:sticky lg:top-24 lg:self-start">
          <SectionNav />
        </aside>
        <div className="min-w-0">{children}</div>
      </div>
    </div>
  );
}
