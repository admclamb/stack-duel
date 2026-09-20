import type { Metadata } from "next";
import Hero from "~/components/landing/hero";
import DuelDemoSection from "~/components/landing/duel-demo-section";
import FeaturesSection from "~/components/landing/features-section";
import FaqSection from "~/components/landing/faq-section";
import CtaSection from "~/components/landing/cta-section";
import SiteLayout from "~/components/layout/site-layout";
import { siteName } from "~/lib/site";

export const metadata: Metadata = {
  title: { absolute: `${siteName} — Real-Time Coding Duels & DSA Practice` },
  alternates: { canonical: "/" },
};

export default function Home() {
  return (
    <SiteLayout>
      <Hero />
      <DuelDemoSection />
      <FeaturesSection />
      <FaqSection />
      <CtaSection />
    </SiteLayout>
  );
}
