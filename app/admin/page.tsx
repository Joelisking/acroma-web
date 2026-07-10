import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { isAdminAuthed } from "@/lib/admin/auth";
import { UsageReport } from "@/components/admin/usage-report";

export const metadata: Metadata = { title: "Usage · Admin · Acroma" };

export default async function AdminUsagePage() {
  if (!(await isAdminAuthed())) redirect("/admin/login");

  return (
    <div className="theme-warm bg-paper text-foreground min-h-dvh px-4 py-8 sm:px-6 lg:px-10">
      <div className="mx-auto flex max-w-5xl flex-col gap-6">
        <header>
          <h1 className="font-heading text-2xl font-medium">Usage &amp; cost</h1>
          <p className="text-sm text-muted-foreground">
            Internal token-cost report across all merchants. Dysruptive only.
          </p>
        </header>
        <UsageReport />
      </div>
    </div>
  );
}
