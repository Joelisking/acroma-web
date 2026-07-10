import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getReceipt } from "@/lib/api/receipt";
import { ReceiptCard } from "@/components/receipt/receipt-card";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ token: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { token } = await params;
  try {
    const receipt = await getReceipt(token);
    return { title: `Receipt · ${receipt.businessName}` };
  } catch {
    return { title: "Receipt" };
  }
}

export default async function ReceiptPage({ params }: Props) {
  const { token } = await params;

  let receipt;
  try {
    receipt = await getReceipt(token);
  } catch {
    notFound();
  }

  return (
    <main className="bg-paper min-h-screen px-4 py-10 print:bg-white print:p-0">
      <ReceiptCard receipt={receipt} />
    </main>
  );
}
