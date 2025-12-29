'use client';

import { useTranslations } from "next-intl";
import { PageWrapper, PageHeader, PageContent } from "@/components/page-wrapper";

export default function PrivacyPage() {
  const t = useTranslations('privacy');

  return (
    <PageWrapper>
      <PageContent>
        <PageHeader
          title={t('title')}
          description={t('subtitle')}
        />

        <div className="prose prose-slate dark:prose-invert max-w-none space-y-8">
          <section>
            <h2 className="text-2xl font-semibold mb-4">{t('collection.title')}</h2>
            <p className="text-muted-foreground leading-relaxed">
              {t('collection.description')}
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">{t('usage.title')}</h2>
            <p className="text-muted-foreground leading-relaxed">
              {t('usage.description')}
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">{t('storage.title')}</h2>
            <p className="text-muted-foreground leading-relaxed">
              {t('storage.description')}
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">{t('sharing.title')}</h2>
            <p className="text-muted-foreground leading-relaxed">
              {t('sharing.description')}
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">{t('cookies.title')}</h2>
            <p className="text-muted-foreground leading-relaxed">
              {t('cookies.description')}
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">{t('rights.title')}</h2>
            <p className="text-muted-foreground leading-relaxed">
              {t('rights.description')}
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
