'use client';

import { useTranslations } from "next-intl";
import { PageWrapper, PageHeader, PageContent } from "@/components/page-wrapper";

export default function TermsPage() {
  const t = useTranslations('terms');

  return (
    <PageWrapper>
      <PageContent>
        <PageHeader
          title={t('title')}
          description={t('subtitle')}
        />

        <div className="prose prose-slate dark:prose-invert max-w-none space-y-8">
          <section>
            <h2 className="text-2xl font-semibold mb-4">{t('acceptance.title')}</h2>
            <p className="text-muted-foreground leading-relaxed">
              {t('acceptance.description')}
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">{t('usage.title')}</h2>
            <p className="text-muted-foreground leading-relaxed">
              {t('usage.description')}
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">{t('accounts.title')}</h2>
            <p className="text-muted-foreground leading-relaxed">
              {t('accounts.description')}
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">{t('intellectualProperty.title')}</h2>
            <p className="text-muted-foreground leading-relaxed">
              {t('intellectualProperty.description')}
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">{t('limitation.title')}</h2>
            <p className="text-muted-foreground leading-relaxed">
              {t('limitation.description')}
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">{t('changes.title')}</h2>
            <p className="text-muted-foreground leading-relaxed">
              {t('changes.description')}
            </p>
          </section>
        </div>
      </PageContent>
    </PageWrapper>
  );
}
