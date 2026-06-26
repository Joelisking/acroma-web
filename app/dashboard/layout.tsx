import { redirect } from "next/navigation";
import { getCurrentBusiness } from "@/lib/api/business";
import { getOnboardingStatus } from "@/lib/api/onboarding";
import { getConversationBadgeCounts } from "@/lib/api/conversations";
import { Sidebar } from "@/components/dashboard/sidebar";
import { TabletRail } from "@/components/dashboard/tablet-rail";
import { TopBar } from "@/components/dashboard/top-bar";
import { MobileBottomNav } from "@/components/dashboard/mobile-bottom-nav";
import { LiveRefresh } from "@/components/conversations/live-refresh";
import { InstallTutorial } from "@/components/pwa/install-tutorial";
import { PullToRefresh } from "@/components/pwa/pull-to-refresh";
import { getVocabulary } from "@/lib/vocabulary";
import { VocabularyProvider } from "@/components/vocabulary-provider";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [business, onboarding, badgeCounts] = await Promise.all([
    getCurrentBusiness(),
    safeStatus(),
    getConversationBadgeCounts(),
  ]);
  // Route through /api/auth/expired so the route handler can actually clear
  // the stale cookies — Server Components can't. Otherwise proxy.ts sees the
  // cookies still in the browser, sends us back to /dashboard, and we loop.
  if (!business) redirect("/api/auth/expired");
  if (onboarding && !onboarding.onboardingCompleted) redirect("/onboarding");

  // Chat tab badge prefers the urgent "you still owe a reply" count over the
  // "unopened messages" count when one is set. Both numbers travel together
  // so the nav can render a distinct tone for waiting (orange) vs unread.
  const badges = {
    "/dashboard/conversations": {
      count: Math.max(badgeCounts.unread, badgeCounts.waiting),
      tone: (badgeCounts.waiting > 0 ? "waiting" : "unread") as
        | "waiting"
        | "unread",
    },
  };

  // Per-merchant vocabulary (e.g. "Catalog" → "Menu" for food merchants).
  // Resolved once here and threaded down to the nav components, which are
  // client-side and would otherwise need a separate round trip to learn it.
  const vocab = getVocabulary(business.businessType);

  return (
    <VocabularyProvider businessType={business.businessType}>
    <div className="theme-warm bg-paper text-foreground flex h-dvh overflow-hidden">
      <Sidebar
        businessName={business.name}
        email={business.email}
        badges={badges}
        vocab={vocab}
      />

      <TabletRail
        badges={badges}
        vocab={vocab}
        name={business.name}
        email={business.email}
      />

      <div className="flex min-w-0 flex-1 flex-col">
        <TopBar whatsappActive={business.whatsappWebhookActive} />

        {/* main is the single scroll container; the shell itself never scrolls,
            so full-height pages (e.g. a conversation) can keep their own inner
            scroll without a second page-level scrollbar. */}
        <main
          id="dashboard-scroll"
          className="min-h-0 flex-1 overflow-y-auto px-4 pt-6 pb-24 sm:px-6 md:pb-10 lg:px-10"
          // pb-24 reserves space for the fixed bottom nav (mobile only; the
          // tablet rail and desktop sidebar are in-flow, so md+ drops it)
        >
          {children}
        </main>

        <MobileBottomNav
          badges={badges}
          vocab={vocab}
          name={business.name}
          email={business.email}
        />
      </div>

      {/* Refresh layout (re-fetching urgent count) on relevant events. */}
      <LiveRefresh
        businessId={business.id}
        events={["conversation_updated", "new_message", "order_updated"]}
      />

      {/* Pull-to-refresh for the installed PWA (no-op outside standalone mode). */}
      <PullToRefresh targetId="dashboard-scroll" />

      {/* Nudge to install the PWA + enable push (self-decides whether to show). */}
      <InstallTutorial />
    </div>
    </VocabularyProvider>
  );
}

async function safeStatus() {
  try {
    return await getOnboardingStatus();
  } catch {
    return null;
  }
}
