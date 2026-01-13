import type { Metadata } from "next";
import { Navbar } from "@/components/navbar";
import { Hero } from "@/components/hero";
import { HowItWorks } from "@/components/how-it-works";
import { UseCases } from "@/components/use-cases";
import { Stats } from "@/components/stats";
import { CTASection } from "@/components/cta-section";
import { Footer } from "@/components/footer";
import { getLocale, getTranslations } from "next-intl/server";

const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://www.voidsleep.com";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  const t = await getTranslations({ locale, namespace: 'meta' });

  return {
    title: t('title'),
    description: t('description'),
    alternates: {
      canonical: baseUrl,
      languages: {
        "en": baseUrl,
        "zh-CN": `${baseUrl}/zh`,
        "x-default": baseUrl,
      },
    },
    openGraph: {
      title: t('title'),
      description: t('description'),
      locale: locale === 'zh-CN' ? 'zh_CN' : 'en_US',
      alternateLocale: locale === 'zh-CN' ? ['en_US'] : ['zh_CN'],
    },
  };
}

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
