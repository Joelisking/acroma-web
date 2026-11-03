import { AdminNav } from "@/components/admin/admin-nav";
import { requireSuperAdmin } from "@/lib/admin/auth";

export default async function AdminConsoleLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireSuperAdmin();

  return (
    <div className="theme-warm bg-paper text-foreground min-h-dvh">
      <AdminNav />
      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-10">{children}</main>
    </div>
  );
}
