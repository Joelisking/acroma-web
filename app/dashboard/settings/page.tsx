import { redirect } from "next/navigation";
import { redirectStaffHome } from "@/lib/api/owner-only";

export default async function SettingsIndex() {
  await redirectStaffHome();

  redirect("/dashboard/settings/whatsapp");
}
