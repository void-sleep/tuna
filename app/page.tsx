import type { Metadata } from "next";
import { Navbar } from "@/components/navbar";
import { Hero } from "@/components/hero";
import { HowItWorks } from "@/components/how-it-works";
import { UseCases } from "@/components/use-cases";
import { Stats } from "@/components/stats";
import { CTASection } from "@/components/cta-section";
import { Footer } from "@/components/footer";

const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://www.voidsleep.com";

export const metadata: Metadata = {
  title: "Tuna - When in doubt, ask Zhuang Zhou",
  description: "Use AI, big data, and cloud computing to solve 'How to choose Y under X conditions' problems. A modern AI-powered decision-making application.",
  alternates: {
    canonical: baseUrl,
    languages: {
      "en": baseUrl,
      "zh-CN": `${baseUrl}/zh`,
      "x-default": baseUrl,
    },
  },
  openGraph: {
    title: "Tuna - When in doubt, ask Zhuang Zhou",
    description: "Use AI, big data, and cloud computing to solve 'How to choose Y under X conditions' problems.",
    locale: "en_US",
    alternateLocale: ["zh_CN"],
  },
};

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1 pt-16">
        <Hero />
        <HowItWorks />
        <UseCases />
        <Stats />
        <CTASection />
      </main>
      <Footer />
    </div>
  );
}
