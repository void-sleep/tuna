'use client';

import { useTranslations } from "next-intl";
import { PageWrapper, PageHeader, PageContent } from "@/components/page-wrapper";

export default function AboutPage() {
  const t = useTranslations('about');

  return (
    <PageWrapper>
      <PageContent>
        <PageHeader
          title={t('title')}
          description={t('subtitle')}
        />

        <div className="prose prose-slate dark:prose-invert max-w-none">
          <section className="mb-12">
            <h2 className="text-2xl font-semibold mb-4">{t('whatIsTuna.title')}</h2>
            <p className="text-muted-foreground leading-relaxed">
              {t('whatIsTuna.description')}
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-semibold mb-4">{t('mission.title')}</h2>
            <p className="text-muted-foreground leading-relaxed">
              {t('mission.description')}
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-semibold mb-4">{t('openSource.title')}</h2>
            <p className="text-muted-foreground leading-relaxed">
              {t('openSource.description')}
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">{t('contact.title')}</h2>
            <p className="text-muted-foreground leading-relaxed">
              {t('contact.description')}
            </p>
          </section>
        </div>
      </PageContent>
    </PageWrapper>
  );
}
