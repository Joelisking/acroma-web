import { FilterBar, type ChipGroup } from "@/components/admin/filter-bar";
import { AuditTable } from "@/components/admin/merchant/audit-table";
import { LoadMore } from "@/components/admin/merchant/load-more";
import { pickUuid } from "@/lib/admin/format";
import { listAudit } from "@/lib/admin/queries";

type Props = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{
    conversationId?: string;
    orderId?: string;
    impersonatorId?: string;
    cursor?: string;
  }>;
};

export default async function MerchantAuditPage({ params, searchParams }: Props) {
  const { id } = await params;
  const sp = await searchParams;
  const { conversationId, orderId, cursor } = sp;
  // "any" = only changes an admin made; a uuid = only that admin's changes.
  const impersonatorId = sp.impersonatorId === "any" ? "any" : pickUuid(sp.impersonatorId);
  const page = await listAudit(id, {
    conversationId,
    orderId,
    impersonatorId,
    cursor,
  });
  const base = `/admin/businesses/${id}/audit`;
  const filters = { conversationId, orderId, impersonatorId };

  const adminChips: ChipGroup = {
    name: "impersonatorId",
    options: [
      { value: undefined, label: "All changes" },
      { value: "any", label: "Only admin changes" },
    ],
  };
  if (impersonatorId && impersonatorId !== "any") {
    const name = page.items.find((e) => e.impersonatorId === impersonatorId)?.impersonatorName;
    adminChips.options.push({
      value: impersonatorId,
      label: `Via ${name ?? "this admin"}`,
    });
  }

  const adminHref = (adminId: string) => {
    const qs = new URLSearchParams();
    for (const [k, v] of Object.entries({
      conversationId,
      orderId,
      impersonatorId: adminId,
    })) {
      if (v) qs.set(k, v);
    }
    return `${base}?${qs.toString()}`;
  };

  return (
    <div className="flex flex-col gap-4">
      <FilterBar
        basePath={base}
        params={filters}
        fields={[
          { name: "conversationId", label: "Conversation id" },
          { name: "orderId", label: "Order id" },
        ]}
        chips={[adminChips]}
      />
      <AuditTable items={page.items} adminHref={adminHref} />
      <LoadMore basePath={base} params={{ ...filters, cursor }} nextCursor={page.nextCursor} />
    </div>
  );
}
