import { FilterBar } from "@/components/admin/filter-bar";
import { AiDecisionsTable } from "@/components/admin/merchant/ai-decisions-table";
import { LoadMore } from "@/components/admin/merchant/load-more";
import { rangeToFrom } from "@/lib/admin/format";
import { listAiDecisions } from "@/lib/admin/queries";

type Props = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ conversationId?: string; range?: string; cursor?: string }>;
};

export default async function MerchantAiPage({ params, searchParams }: Props) {
  const { id } = await params;
  const { conversationId, range, cursor } = await searchParams;
  const page = await listAiDecisions(id, {
    conversationId,
    from: rangeToFrom(range),
    cursor,
  });
  const base = `/admin/businesses/${id}/ai`;

  return (
    <div className="flex flex-col gap-4">
      <FilterBar
        basePath={base}
        params={{ conversationId, range }}
        fields={[{ name: "conversationId", label: "Conversation id" }]}
        ranges
      />
      <AiDecisionsTable items={page.items} />
      <LoadMore
        basePath={base}
        params={{ conversationId, range, cursor }}
        nextCursor={page.nextCursor}
      />
    </div>
  );
}
