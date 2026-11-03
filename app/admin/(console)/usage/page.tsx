import type { Metadata } from "next";

import { UsageReport } from "@/components/admin/usage-report";

export const metadata: Metadata = { title: "Usage · Admin · Acroma" };

export default function AdminUsagePage() {
  return (
    <div className="flex flex-col gap-6">
      <header>
        <h1 className="font-heading text-2xl font-medium">Usage &amp; cost</h1>
        <p className="text-sm text-muted-foreground">
          Internal token-cost report across all merchants.
        </p>
      </header>
      <UsageReport />
    </div>
  );
}
