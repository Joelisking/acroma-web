import { redirect } from "next/navigation";
import { getCurrentBusiness } from "@/lib/api/business";
import { getOnboardingStatus } from "@/lib/api/onboarding";
import { countUnreadConversations } from "@/lib/api/conversations";
import { Sidebar } from "@/components/dashboard/sidebar";
import { TopBar } from "@/components/dashboard/top-bar";
import { MobileBottomNav } from "@/components/dashboard/mobile-bottom-nav";
import { LiveRefresh } from "@/components/conversations/live-refresh";
import { InstallTutorial } from "@/components/pwa/install-tutorial";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [business, onboarding, unreadCount] = await Promise.all([
    getCurrentBusiness(),
    safeStatus(),
    countUnreadConversations(),
  ]);
  // Route through /api/auth/expired so the route handler can actually clear
  // the stale cookies — Server Components can't. Otherwise proxy.ts sees the
  // cookies still in the browser, sends us back to /dashboard, and we loop.
  if (!business) redirect("/api/auth/expired");
  if (onboarding && !onboarding.onboardingCompleted) redirect("/onboarding");

  const badges = { "/dashboard/conversations": unreadCount };

  return (
    <div className="bg-background text-foreground flex h-dvh overflow-hidden">
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

        {/* main is the single scroll container; the shell itself never scrolls,
            so full-height pages (e.g. a conversation) can keep their own inner
            scroll without a second page-level scrollbar. */}
        <main
          className="min-h-0 flex-1 overflow-y-auto px-4 pt-6 pb-24 sm:px-6 lg:px-10 lg:pb-10"
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

      {/* Nudge to install the PWA + enable push (self-decides whether to show). */}
      <InstallTutorial />
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
