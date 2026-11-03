import { FilterBar } from "@/components/admin/filter-bar";
import { AuditTable } from "@/components/admin/merchant/audit-table";
import { LoadMore } from "@/components/admin/merchant/load-more";
import { listAudit } from "@/lib/admin/queries";

type Props = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ conversationId?: string; orderId?: string; cursor?: string }>;
};

export default async function MerchantAuditPage({ params, searchParams }: Props) {
  const { id } = await params;
  const { conversationId, orderId, cursor } = await searchParams;
  const page = await listAudit(id, { conversationId, orderId, cursor });
  const base = `/admin/businesses/${id}/audit`;

  return (
    <div className="flex flex-col gap-4">
      <FilterBar
        basePath={base}
        params={{ conversationId, orderId }}
        fields={[
          { name: "conversationId", label: "Conversation id" },
          { name: "orderId", label: "Order id" },
        ]}
      />
      <AuditTable items={page.items} />
      <LoadMore
        basePath={base}
        params={{ conversationId, orderId, cursor }}
        nextCursor={page.nextCursor}
      />
    </div>
  );
}
