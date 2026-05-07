import { redirect } from "next/navigation";
import { isAuthenticated } from "@/lib/api/auth";

/**
 * Root route: bounce to dashboard if signed in, otherwise to login.
 * Replace later with a real marketing landing page.
 */
export default async function Home() {
  if (await isAuthenticated()) redirect("/dashboard");
  redirect("/login");
}
