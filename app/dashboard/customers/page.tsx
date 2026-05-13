import type { Metadata } from "next";
import { listCustomers } from "@/lib/api/customers";
import { CustomerRow } from "@/components/customers/customer-row";

export const metadata: Metadata = { title: "Customers · Acroma" };

export default async function CustomersPage() {
  const customers = await listCustomers();
  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-6">
      <header>
        <p className="eyebrow text-muted-foreground">People</p>
        <h1 className="font-display text-foreground mt-1 text-3xl font-medium tracking-tight">
          Customers
        </h1>
        <p className="text-muted-foreground mt-1 text-sm">
          Everyone who&apos;s messaged or ordered. Toggle opt-out to exclude someone from broadcasts.
        </p>
      </header>

      {customers.length === 0 ? (
        <div className="border-border/70 bg-card rounded-2xl border p-8 text-center">
          <p className="text-foreground text-sm font-medium">No customers yet</p>
          <p className="text-muted-foreground mt-1 text-sm">
            Once people start ordering or messaging, they&apos;ll show up here.
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {customers.map((c) => (
            <CustomerRow key={c.id} customer={c} />
          ))}
        </div>
      )}
    </div>
  );
}
