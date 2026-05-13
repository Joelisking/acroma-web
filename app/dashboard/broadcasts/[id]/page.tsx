import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getBroadcast } from "@/lib/api/broadcasts";
import { ApiError } from "@/lib/api/server";
import { BroadcastDetail } from "@/components/broadcasts/broadcast-detail";

type PageProps = { params: Promise<{ id: string }> };

export const metadata: Metadata = { title: "Broadcast · Acroma" };

export default async function BroadcastDetailPage({ params }: PageProps) {
  const { id } = await params;
  let broadcast;
  try {
    broadcast = await getBroadcast(id);
  } catch (err) {
    if (err instanceof ApiError && err.status === 404) notFound();
    throw err;
  }

  return (
    <div className="mx-auto max-w-3xl">
      <BroadcastDetail broadcast={broadcast} />
    </div>
  );
}
