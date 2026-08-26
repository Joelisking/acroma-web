import { redirect } from "next/navigation";
import { redirectStaffToOrders } from "@/lib/api/owner-only";

export default async function SettingsIndex() {
  await redirectStaffToOrders();

  redirect("/dashboard/settings/whatsapp");
}
