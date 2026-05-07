import "server-only";
import { apiFetch } from "./server";
import type { BankSummary, PayoutAccount } from "./types";

export async function getPayoutAccount(): Promise<PayoutAccount> {
  return apiFetch<PayoutAccount>("/payments/payout-account");
}

export async function listBanks(
  type: "bank" | "momo",
): Promise<BankSummary[]> {
  return apiFetch<BankSummary[]>(`/payments/banks?type=${type}`);
}
