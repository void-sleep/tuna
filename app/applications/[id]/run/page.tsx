'use client';

import { use, useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { BinaryChoiceRunner } from "@/components/binary-choice-runner";
import { MathFlashRunner } from "@/components/math-flash-runner";
import { AgreeQuestionRunner } from "@/components/agree-question-runner";
import type { BinaryChoiceConfig } from "@/components/binary-choice-editor";
import type { MathFlashConfig } from "@/components/math-flash-editor";
import { DEFAULT_MATH_FLASH_CONFIG } from "@/components/math-flash-editor";
import type { AgreeQuestionConfig } from "@/components/agree-question-editor";
import { DEFAULT_AGREE_QUESTION_CONFIG } from "@/components/agree-question-editor";
import type { Application, ApplicationType } from "@/lib/supabase/applications";
import type { ApplicationItem } from "@/lib/supabase/application-items";
import { ArrowLeftIcon, PencilIcon, XMarkIcon, ArrowsPointingOutIcon, ArrowsPointingInIcon } from "@heroicons/react/24/outline";

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

const APP_TYPE_STYLES: Record<ApplicationType, { bgGradient: string; icon: string }> = {
  coin: { bgGradient: 'from-slate-900 via-violet-950/50 to-slate-900', icon: '🎲' },
  math_flash: { bgGradient: 'from-slate-900 via-orange-950/50 to-slate-900', icon: '🧮' },
  wheel: { bgGradient: 'from-slate-900 via-amber-950/50 to-slate-900', icon: '🎡' },
  counter: { bgGradient: 'from-slate-900 via-sky-950/50 to-slate-900', icon: '🔢' },
  agree_question: { bgGradient: 'from-slate-900 via-indigo-950/50 to-slate-900', icon: '💭' },
};

export default function RunApplicationPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const tBinary = useTranslations('binaryChoice.run');
  const tMath = useTranslations('mathFlash.run');
  const tAgree = useTranslations('agreeQuestion.run');
  const router = useRouter();

  const [application, setApplication] = useState<Application | null>(null);
  const [binaryConfig, setBinaryConfig] = useState<BinaryChoiceConfig>(DEFAULT_BINARY_CONFIG);
  const [mathConfig, setMathConfig] = useState<MathFlashConfig>(DEFAULT_MATH_FLASH_CONFIG);
  const [agreeConfig, setAgreeConfig] = useState<AgreeQuestionConfig>(DEFAULT_AGREE_QUESTION_CONFIG);
  const [isLoading, setIsLoading] = useState(true);
  const [hasItems, setHasItems] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const appType = application?.type || 'coin';
  const styles = APP_TYPE_STYLES[appType];
  const t = appType === 'math_flash' ? tMath : (appType === 'agree_question' ? tAgree : tBinary);

  // Exit fullscreen when leaving the page
  const exitFullscreen = useCallback(() => {
    if (document.fullscreenElement) {
      document.exitFullscreen().catch(() => {});
    }
  }, []);

  const handleExit = useCallback(() => {
    exitFullscreen();
    router.push('/apps');
  }, [router, exitFullscreen]);

  // Toggle browser fullscreen
  const toggleFullscreen = useCallback(() => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().then(() => {
        setIsFullscreen(true);
      }).catch(() => {});
    } else {
      document.exitFullscreen().then(() => {
        setIsFullscreen(false);
      }).catch(() => {});
    }
  }, []);

  // Listen for fullscreen changes
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  // Keyboard controls
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      handleExit();
    }
  }, [handleExit]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

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
          setHasItems(true); // Math flash doesn't need items
        } else if (data.type === 'agree_question') {
          // Load agree question config from application.config
          if (data.config && Object.keys(data.config).length > 0) {
            setAgreeConfig({
              defaultQuestion: (data.config.defaultQuestion as string) || DEFAULT_AGREE_QUESTION_CONFIG.defaultQuestion,
              defaultOptions: (data.config.defaultOptions as string[]) || DEFAULT_AGREE_QUESTION_CONFIG.defaultOptions,
            });
          }
          setHasItems(true); // Agree question doesn't need items
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
                setHasItems(true);
              } else {
                setHasItems(false);
              }
            } else {
              setHasItems(false);
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

  // Loading state - fullscreen
  if (isLoading) {
    return (
      <div className={`fixed inset-0 bg-gradient-to-br ${styles.bgGradient} flex items-center justify-center`}>
        <div className="text-center">
          <div className="relative mb-8">
            <div className="absolute inset-0 bg-sky-500/30 rounded-full blur-2xl animate-pulse" />
            <div className="relative w-24 h-24 rounded-full bg-gradient-to-br from-sky-500/20 to-blue-500/20 border-2 border-sky-500/30 flex items-center justify-center">
              <span className="text-4xl animate-pulse">{styles.icon}</span>
            </div>
          </div>
          <p className="text-lg text-sky-300/80">Loading...</p>
        </div>
      </div>
    );
  }

  // Application not found - fullscreen
  if (!application) {
    return (
      <div className={`fixed inset-0 bg-gradient-to-br ${styles.bgGradient} flex items-center justify-center`}>
        <div className="text-center">
          <div className="relative mb-8">
            <div className="absolute inset-0 bg-red-500/20 rounded-full blur-2xl" />
            <div className="relative w-24 h-24 rounded-full bg-gradient-to-br from-red-500/10 to-rose-500/10 border-2 border-red-500/30 flex items-center justify-center">
              <span className="text-4xl">❌</span>
            </div>
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Application not found</h2>
          <p className="text-sky-300/60 mb-6">The application you&apos;re looking for doesn&apos;t exist.</p>
          <Button asChild className="gap-2 bg-sky-600 hover:bg-sky-500 text-white rounded-xl">
            <Link href="/apps">
              <ArrowLeftIcon className="h-4 w-4" />
              Back to Apps
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  // No items configured (only for binary choice) - fullscreen
  if (!hasItems && appType === 'coin') {
    return (
      <div className={`fixed inset-0 bg-gradient-to-br ${styles.bgGradient} flex items-center justify-center`}>
        <div className="text-center">
          <div className="relative mb-8">
            <div className="absolute inset-0 bg-amber-500/20 rounded-full blur-2xl" />
            <div className="relative w-32 h-32 rounded-full bg-gradient-to-br from-amber-500/10 to-orange-500/10 border-2 border-dashed border-amber-500/30 flex items-center justify-center">
              <span className="text-5xl">📝</span>
            </div>
          </div>
          <h2 className="text-3xl font-bold text-white mb-4">{tBinary('noItems.title')}</h2>
          <p className="text-lg text-violet-300/60 mb-8 max-w-md">
            {tBinary('noItems.description')}
          </p>
          <div className="flex gap-4 justify-center">
            <Button variant="outline" asChild className="gap-2 rounded-xl border-violet-500/30 text-violet-300 hover:bg-violet-500/10">
              <Link href="/apps">
                <ArrowLeftIcon className="h-4 w-4" />
                {tBinary('noItems.backToApps')}
              </Link>
            </Button>
            <Button asChild className="gap-2 rounded-xl bg-violet-600 hover:bg-violet-500 text-white shadow-lg shadow-violet-500/25">
              <Link href={`/apps/applications/${id}/edit`}>
                <PencilIcon className="h-4 w-4" />
                {tBinary('noItems.configureOptions')}
              </Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const colorClass = appType === 'math_flash' ? 'orange' : (appType === 'agree_question' ? 'indigo' : 'violet');

  // Main fullscreen runner
  return (
    <div className={`fixed inset-0 bg-gradient-to-br ${styles.bgGradient} overflow-hidden`}>
      {/* Runner component - behind everything */}
      <div className="absolute inset-0 z-0">
        {appType === 'math_flash' ? (
          <MathFlashRunner config={mathConfig} applicationId={id} fullscreen={true} />
        ) : appType === 'agree_question' ? (
          <AgreeQuestionRunner
            applicationId={id}
            defaultQuestion={agreeConfig.defaultQuestion}
            defaultOptions={agreeConfig.defaultOptions}
          />
        ) : (
          <BinaryChoiceRunner config={binaryConfig} applicationId={id} fullscreen={true} />
        )}
      </div>

      {/* Top bar - above runner */}
      <div className="absolute top-0 left-0 right-0 z-50 p-4 flex items-center justify-between pointer-events-auto">
        {/* Exit button - clickable */}
        <Button
          variant="ghost"
          size="sm"
          onClick={handleExit}
          className={`gap-2 text-white bg-${colorClass}-500/30 hover:bg-${colorClass}-500/50 border border-${colorClass}-400/40 rounded-xl px-4 pointer-events-auto backdrop-blur-sm`}
        >
          <XMarkIcon className="h-5 w-5" />
          <span className="text-sm font-medium">{t('exit')}</span>
        </Button>

        {/* Application title */}
        <div className="absolute left-1/2 -translate-x-1/2 flex items-center gap-3 pointer-events-none">
          <span className={`inline-flex items-center gap-2 px-4 py-2 rounded-full bg-${colorClass}-500/10 border border-${colorClass}-500/20 text-${colorClass}-300 text-sm font-medium backdrop-blur-sm`}>
            <span className="text-lg">{styles.icon}</span>
            {application.title}
          </span>
        </div>

        {/* Right buttons */}
        <div className="flex items-center gap-2">
          {/* Fullscreen toggle button */}
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleFullscreen}
            className={`gap-2 text-white bg-${colorClass}-500/30 hover:bg-${colorClass}-500/50 border border-${colorClass}-400/40 rounded-xl px-4 pointer-events-auto backdrop-blur-sm`}
          >
            {isFullscreen ? (
              <ArrowsPointingInIcon className="h-4 w-4" />
            ) : (
              <ArrowsPointingOutIcon className="h-4 w-4" />
            )}
            <span className="text-sm font-medium">{t('fullscreen')}</span>
          </Button>

          {/* Edit button */}
          <Button
            variant="ghost"
            size="sm"
            asChild
            className={`gap-2 text-white bg-${colorClass}-500/30 hover:bg-${colorClass}-500/50 border border-${colorClass}-400/40 rounded-xl px-4 pointer-events-auto backdrop-blur-sm`}
          >
            <Link href={`/apps/applications/${id}/edit`}>
              <PencilIcon className="h-4 w-4" />
              <span className="text-sm font-medium">{t('edit')}</span>
            </Link>
          </Button>
        </div>
      </div>

      {/* Keyboard hint */}
      <div className={`absolute bottom-4 left-1/2 -translate-x-1/2 z-50 text-${colorClass}-300/40 text-sm flex items-center gap-4 pointer-events-none`}>
        <span className="flex items-center gap-1">
          <kbd className={`px-2 py-0.5 rounded bg-${colorClass}-500/10 border border-${colorClass}-500/20 text-xs`}>ESC</kbd>
          <span>{t('exit')}</span>
        </span>
      </div>
    </div>
  );
}
