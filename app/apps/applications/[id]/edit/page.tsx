'use client';

import { use, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { BinaryChoiceEditor, type BinaryChoiceConfig } from "@/components/binary-choice-editor";
import { MathFlashEditor, type MathFlashConfig, DEFAULT_MATH_FLASH_CONFIG } from "@/components/math-flash-editor";
import { AgreeQuestionEditor, type AgreeQuestionConfig, DEFAULT_AGREE_QUESTION_CONFIG } from "@/components/agree-question-editor";
import { PageWrapper, PageHeader, PageContent } from "@/components/page-wrapper";
import { ArrowLeftIcon, CheckIcon, PlayIcon } from "@heroicons/react/24/outline";
import type { Application, ApplicationType } from "@/lib/supabase/applications";
import type { ApplicationItem } from "@/lib/supabase/application-items";

const DEFAULT_BINARY_CONFIG: BinaryChoiceConfig = {
  optionA: {
    text: 'To Be',
    icon: '🌱',
    description: 'Choose to continue forward',
    color: 'green',
  },
  optionB: {
    text: 'Not To Be',
    icon: '💥',
    description: 'Choose to give up',
    color: 'red',
  },
};

const APP_TYPE_CONFIG: Record<ApplicationType, { icon: string; colorClass: string; bgClass: string; borderClass: string }> = {
  coin: {
    icon: '🎲',
    colorClass: 'text-violet-600 dark:text-violet-400',
    bgClass: 'bg-violet-500/10',
    borderClass: 'border-violet-500/20',
  },
  math_flash: {
    icon: '🧮',
    colorClass: 'text-sky-600 dark:text-sky-400',
    bgClass: 'bg-sky-500/10',
    borderClass: 'border-sky-500/20',
  },
  wheel: {
    icon: '🎡',
    colorClass: 'text-amber-600 dark:text-amber-400',
    bgClass: 'bg-amber-500/10',
    borderClass: 'border-amber-500/20',
  },
  counter: {
    icon: '🔢',
    colorClass: 'text-emerald-600 dark:text-emerald-400',
    bgClass: 'bg-emerald-500/10',
    borderClass: 'border-emerald-500/20',
  },
  agree_question: {
    icon: '💭',
    colorClass: 'text-indigo-600 dark:text-indigo-400',
    bgClass: 'bg-indigo-500/10',
    borderClass: 'border-indigo-500/20',
  },
};

export default function EditApplicationPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const tBinary = useTranslations('binaryChoice.edit');
  const tMath = useTranslations('mathFlash.edit');
  const router = useRouter();

  const [application, setApplication] = useState<Application | null>(null);
  const [binaryConfig, setBinaryConfig] = useState<BinaryChoiceConfig>(DEFAULT_BINARY_CONFIG);
  const [mathConfig, setMathConfig] = useState<MathFlashConfig>(DEFAULT_MATH_FLASH_CONFIG);
  const [agreeConfig, setAgreeConfig] = useState<AgreeQuestionConfig>(DEFAULT_AGREE_QUESTION_CONFIG);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const appType = application?.type || 'coin';
  const typeConfig = APP_TYPE_CONFIG[appType];
  const tAgree = useTranslations('agreeQuestion.edit');
  const t = appType === 'math_flash' ? tMath : (appType === 'agree_question' ? tAgree : tBinary);

  useEffect(() => {
    async function fetchApplication() {
      try {
        const response = await fetch(`/api/applications/${id}`);
        if (!response.ok) {
          throw new Error('Failed to fetch application');
        }
        const data: Application = await response.json();
        setApplication(data);

        if (data.type === 'math_flash') {
          // Load math flash config from application.config
          if (data.config && Object.keys(data.config).length > 0) {
            setMathConfig({
              minNumber: (data.config.minNumber as number) || DEFAULT_MATH_FLASH_CONFIG.minNumber,
              maxNumber: (data.config.maxNumber as number) || DEFAULT_MATH_FLASH_CONFIG.maxNumber,
              operations: (data.config.operations as MathFlashConfig['operations']) || DEFAULT_MATH_FLASH_CONFIG.operations,
              questionCount: (data.config.questionCount as number) || DEFAULT_MATH_FLASH_CONFIG.questionCount,
              timePerQuestion: (data.config.timePerQuestion as number) || DEFAULT_MATH_FLASH_CONFIG.timePerQuestion,
              answerDisplayTime: (data.config.answerDisplayTime as number) || DEFAULT_MATH_FLASH_CONFIG.answerDisplayTime,
              difficulty: (data.config.difficulty as 1 | 2 | 3) || DEFAULT_MATH_FLASH_CONFIG.difficulty,
            });
          }
        } else if (data.type === 'agree_question') {
          // Load agree question config from application.config
          if (data.config && Object.keys(data.config).length > 0) {
            setAgreeConfig({
              defaultQuestion: (data.config.defaultQuestion as string) || DEFAULT_AGREE_QUESTION_CONFIG.defaultQuestion,
              defaultOptions: (data.config.defaultOptions as string[]) || DEFAULT_AGREE_QUESTION_CONFIG.defaultOptions,
            });
          }
        } else if (data.type === 'coin') {
          // Fetch application items for binary choice
          const itemsResponse = await fetch(`/api/applications/${id}/items`);
          if (itemsResponse.ok) {
            const items: ApplicationItem[] = await itemsResponse.json();

            if (items.length >= 2) {
              const optionA = items.find(item => item.position === 0);
              const optionB = items.find(item => item.position === 1);

              if (optionA && optionB) {
                setBinaryConfig({
                  optionA: {
                    text: optionA.text,
                    icon: optionA.icon || '🌱',
                    description: optionA.description || '',
                    color: (optionA.metadata.color as string) || 'green',
                  },
                  optionB: {
                    text: optionB.text,
                    icon: optionB.icon || '💥',
                    description: optionB.description || '',
                    color: (optionB.metadata.color as string) || 'red',
                  },
                });
              }
            }
          }
        }
      } catch (error) {
        console.error('Error fetching application:', error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchApplication();
  }, [id]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      if (appType === 'math_flash') {
        // Save math flash config to application.config
        const response = await fetch(`/api/applications/${id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ config: mathConfig }),
        });

        if (!response.ok) {
          throw new Error('Failed to save application');
        }
      } else if (appType === 'agree_question') {
        // Save agree question config to application.config
        const response = await fetch(`/api/applications/${id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ config: agreeConfig }),
        });

        if (!response.ok) {
          throw new Error('Failed to save application');
        }
      } else if (appType === 'coin') {
        // Save binary choice items to application_items table
        const itemsToSave = [
          {
            text: binaryConfig.optionA.text,
            icon: binaryConfig.optionA.icon,
            description: binaryConfig.optionA.description,
            metadata: { color: binaryConfig.optionA.color },
            position: 0,
          },
          {
            text: binaryConfig.optionB.text,
            icon: binaryConfig.optionB.icon,
            description: binaryConfig.optionB.description,
            metadata: { color: binaryConfig.optionB.color },
            position: 1,
          },
        ];

        const response = await fetch(`/api/applications/${id}/items`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ items: itemsToSave }),
        });

        if (!response.ok) {
          throw new Error('Failed to save application items');
        }
      }

      router.push('/apps');
    } catch (error) {
      console.error('Error saving application:', error);
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <PageWrapper>
        <PageContent>
          <div className="flex flex-col items-center justify-center py-24">
            <div className="relative mb-8">
              <div className="absolute inset-0 bg-gradient-to-r from-sky-500/20 to-blue-500/20 rounded-full blur-2xl" />
              <div className="relative w-24 h-24 rounded-full bg-gradient-to-br from-sky-500/10 to-blue-500/10 border-2 border-sky-500/30 flex items-center justify-center animate-pulse">
                <span className="text-4xl">⏳</span>
              </div>
            </div>
            <p className="text-lg text-muted-foreground">Loading...</p>
          </div>
        </PageContent>
      </PageWrapper>
    );
  }

  if (!application) {
    return (
      <PageWrapper>
        <PageContent>
          <div className="flex flex-col items-center justify-center py-24">
            <div className="relative mb-8">
              <div className="absolute inset-0 bg-gradient-to-r from-red-500/20 to-rose-500/20 rounded-full blur-2xl" />
              <div className="relative w-24 h-24 rounded-full bg-gradient-to-br from-red-500/10 to-rose-500/10 border-2 border-red-500/30 flex items-center justify-center">
                <span className="text-4xl">❌</span>
              </div>
            </div>
            <h2 className="text-2xl font-bold mb-2">Application not found</h2>
            <p className="text-muted-foreground mb-6">The application you&apos;re looking for doesn&apos;t exist.</p>
            <Button asChild className="gap-2 bg-sky-600 hover:bg-sky-500 text-white">
              <Link href="/apps">
                <ArrowLeftIcon className="h-4 w-4" />
                Back to Apps
              </Link>
            </Button>
          </div>
        </PageContent>
      </PageWrapper>
    );
  }

  // Use consistent violet color for action buttons across all app types
  const buttonColorClass = 'bg-violet-600 hover:bg-violet-500 shadow-violet-500/25';
  const outlineColorClass = 'border-violet-500/30 text-violet-600 dark:text-violet-400 hover:bg-violet-500/10';

  return (
    <PageWrapper>
      <PageContent>
        {/* Back Button */}
        <div className="mb-6">
          <Button variant="ghost" asChild className="gap-2 text-muted-foreground hover:text-foreground">
            <Link href="/apps">
              <ArrowLeftIcon className="h-4 w-4" />
              {t('buttons.backToApps')}
            </Link>
          </Button>
        </div>

        {/* Header */}
        <PageHeader
          title={t('title')}
          description={t('subtitle')}
        />

        {/* Application Badge */}
        <div className="mb-8 flex items-center gap-4">
          <span className={`inline-flex items-center gap-2 px-4 py-2 rounded-full ${typeConfig.bgClass} ${typeConfig.colorClass} text-sm font-medium border ${typeConfig.borderClass}`}>
            <span className="text-lg">{typeConfig.icon}</span>
            {application.title}
          </span>

          {/* Quick test button */}
          <Button
            variant="outline"
            size="sm"
            asChild
            className={`gap-2 rounded-xl ${outlineColorClass}`}
          >
            <Link href={`/applications/${id}/run`}>
              <PlayIcon className="h-4 w-4" />
              {t('buttons.preview') || 'Preview'}
            </Link>
          </Button>
        </div>

        {/* Editor - Conditional based on type */}
        {appType === 'math_flash' ? (
          <MathFlashEditor config={mathConfig} onChange={setMathConfig} />
        ) : appType === 'agree_question' ? (
          <AgreeQuestionEditor config={agreeConfig} onChange={setAgreeConfig} />
        ) : (
          <BinaryChoiceEditor config={binaryConfig} onChange={setBinaryConfig} />
        )}

        {/* Actions */}
        <div className="flex justify-end gap-4 mt-10 pt-8 border-t">
          <Button
            variant="outline"
            asChild
            disabled={isSaving}
            className="rounded-xl px-6"
          >
            <Link href="/apps">{t('buttons.cancel')}</Link>
          </Button>
          <Button
            onClick={handleSave}
            disabled={isSaving}
            className={`gap-2 rounded-xl px-8 text-white shadow-lg ${buttonColorClass}`}
          >
            <CheckIcon className="h-4 w-4" />
            {isSaving ? t('buttons.saving') : t('buttons.save')}
          </Button>
        </div>
      </PageContent>
    </PageWrapper>
  );
}
