import { SectionNav } from "@/components/settings/section-nav";
import { PageHeader } from "@/components/shared/page-header";

export default function SettingsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <PageHeader
        title="Settings"
        description="Connect channels, configure payments, and tune Acroma to your business."
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[200px_minmax(0,1fr)]">
        <aside className="min-w-0 lg:sticky lg:top-24 lg:self-start">
          <SectionNav />
        </aside>
        <div className="min-w-0">{children}</div>
      </div>
    </div>
  );
}
