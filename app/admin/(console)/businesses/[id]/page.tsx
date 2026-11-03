import { MerchantOverview } from "@/components/admin/merchant/overview";
import { getMerchant, listMerchantLogs } from "@/lib/admin/queries";

type Props = { params: Promise<{ id: string }> };

export default async function MerchantOverviewPage({ params }: Props) {
  const { id } = await params;
  const [merchant, logs] = await Promise.all([
    getMerchant(id),
    // Errors only, to match the card's "errors in the last 24h" count.
    listMerchantLogs(id, { level: "error", take: "5" }),
  ]);

  return <MerchantOverview merchant={merchant} errors={logs.items} />;
}
