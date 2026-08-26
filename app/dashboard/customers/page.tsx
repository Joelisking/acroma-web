import type { Metadata } from "next";
import { Users } from "lucide-react";
import { listCustomers } from "@/lib/api/customers";
import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { CustomerRow } from "@/components/customers/customer-row";
import { ExportCsvButton } from "@/components/customers/export-csv-button";
import { redirectStaffToOrders } from "@/lib/api/owner-only";

export const metadata: Metadata = { title: "Customers · Acroma" };

export default async function CustomersPage() {
  await redirectStaffToOrders();

  const customers = await listCustomers();
  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-6">
      <PageHeader
        title="Customers"
        description="Everyone who's messaged or ordered. Toggle opt-out to exclude someone from broadcasts."
        actions={customers.length > 0 ? <ExportCsvButton /> : null}
      />

      {customers.length === 0 ? (
        <EmptyState
          icon={Users}
          title="No customers yet."
          description="Once people start ordering or messaging, they show up here."
        />
      ) : (
        <div className="flex flex-col gap-2">
          {customers.map((c) => (
            <CustomerRow key={c.id} customer={c} />
          ))}
        </div>
      )}
    </div>
  );
}
