import { redirect } from "next/navigation"

/** Workers moved onto the Team screen. Old links land there. */
export default function WorkersSettingsPage() {
  redirect("/dashboard/settings/team")
}
