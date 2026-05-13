import "server-only";
import { apiFetch } from "./server";
import type { Broadcast, BroadcastAudienceBucket } from "./types";

export async function listBroadcasts(): Promise<Broadcast[]> {
  return apiFetch<Broadcast[]>("/broadcasts");
}

export async function getBroadcast(id: string): Promise<Broadcast> {
  return apiFetch<Broadcast>(`/broadcasts/${id}`);
}

export async function previewRecipientCount(
  bucket: BroadcastAudienceBucket,
): Promise<{ count: number }> {
  return apiFetch<{ count: number }>(
    `/broadcasts/preview-count?bucket=${bucket}`,
  );
}
