import "server-only";
import { apiFetch } from "./server";
import type { WhatsappTemplate } from "./types";

export async function listTemplates(): Promise<WhatsappTemplate[]> {
  return apiFetch<WhatsappTemplate[]>("/templates");
}
