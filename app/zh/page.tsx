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
  title: "Tuna - 万事不决问庄周",
  description: "利用 AI、大数据、云计算等技术解决 X 条件下如何选择 Y 的问题。一个现代化的 AI 驱动随机决策应用。",
  alternates: {
    canonical: `${baseUrl}/zh`,
    languages: {
      "en": baseUrl,
      "zh-CN": `${baseUrl}/zh`,
      "x-default": baseUrl,
    },
  },
  openGraph: {
    title: "Tuna - 万事不决问庄周",
    description: "利用 AI、大数据、云计算等技术解决 X 条件下如何选择 Y 的问题。",
    locale: "zh_CN",
    alternateLocale: ["en_US"],
  },
};

export default function ZhHomePage() {
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
