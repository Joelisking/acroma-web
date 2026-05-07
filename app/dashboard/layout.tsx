import { redirect } from "next/navigation";
import { getCurrentBusiness } from "@/lib/api/business";
import { getOnboardingStatus } from "@/lib/api/onboarding";
import { countUrgentConversations } from "@/lib/api/conversations";
import { Sidebar } from "@/components/dashboard/sidebar";
import { TopBar } from "@/components/dashboard/top-bar";
import { MobileBottomNav } from "@/components/dashboard/mobile-bottom-nav";
import { LiveRefresh } from "@/components/conversations/live-refresh";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [business, onboarding, urgentCount] = await Promise.all([
    getCurrentBusiness(),
    safeStatus(),
    countUrgentConversations(),
  ]);
  // Route through /api/auth/expired so the route handler can actually clear
  // the stale cookies — Server Components can't. Otherwise proxy.ts sees the
  // cookies still in the browser, sends us back to /dashboard, and we loop.
  if (!business) redirect("/api/auth/expired");
  if (onboarding && !onboarding.onboardingCompleted) redirect("/onboarding");

  const badges = { "/dashboard/conversations": urgentCount };

  return (
    <div className="bg-background text-foreground flex min-h-svh">
      <Sidebar
        businessName={business.name}
        email={business.email}
        badges={badges}
      />

      <div className="flex min-w-0 flex-1 flex-col">
        <TopBar
          businessName={business.name}
          whatsappActive={business.whatsappWebhookActive}
        />

        <main
          className="flex-1 px-4 pt-6 pb-24 sm:px-6 lg:px-10 lg:pb-10"
          // pb-24 on mobile reserves space for the fixed bottom nav
        >
          {children}
        </main>

        <MobileBottomNav badges={badges} />
      </div>

      {/* Refresh layout (re-fetching urgent count) on relevant events. */}
      <LiveRefresh
        businessId={business.id}
        events={["conversation_updated", "new_message", "order_updated"]}
      />
    </div>
  );
}

async function safeStatus() {
  try {
    return await getOnboardingStatus();
  } catch {
    return null;
  }
}
