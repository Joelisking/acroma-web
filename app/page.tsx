import type { Metadata } from "next"

import { FaqSection } from "@/components/marketing/faq-section"
import { FeaturesBento } from "@/components/marketing/features-bento"
import { FinalCta } from "@/components/marketing/final-cta"
import { Hero } from "@/components/marketing/hero"
import { HowItWorks } from "@/components/marketing/how-it-works"
import { PricingSection } from "@/components/marketing/pricing-section"
import { ProblemSection } from "@/components/marketing/problem-section"
import { ProofStrip } from "@/components/marketing/proof-strip"
import { SiteFooter } from "@/components/marketing/site-footer"
import { SiteNav } from "@/components/marketing/site-nav"
import { TakeoverCallout } from "@/components/marketing/takeover-callout"
import { isAuthenticated } from "@/lib/api/auth"

export const metadata: Metadata = {
  title: "Acroma, take orders on WhatsApp while you sleep",
  description:
    "Acroma answers your customers on WhatsApp, takes the order, and collects mobile money payments. Every order lands on one live dashboard. No monthly fee, 1% when you get paid.",
  alternates: { canonical: "/" },
  openGraph: {
    title: "Acroma, take orders on WhatsApp while you sleep",
    description:
      "AI order management and customer service for businesses that sell by chat in Ghana and across West Africa.",
    type: "website",
  },
}

/**
 * Public landing page. Served to everyone: a signed-in merchant sees the same
 * page with the calls to action pointing at their dashboard instead of signup.
 */
export default async function Home() {
  const signedIn = await isAuthenticated()

  return (
    <>
      <SiteNav signedIn={signedIn} />
      <main>
        <Hero signedIn={signedIn} />
        <ProblemSection />
        <HowItWorks />
        <FeaturesBento />
        <TakeoverCallout />
        <ProofStrip />
        <PricingSection signedIn={signedIn} />
        <FaqSection />
        <FinalCta signedIn={signedIn} />
      </main>
      <SiteFooter />
    </>
  )
}
