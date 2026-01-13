'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
  ChatBubbleLeftRightIcon,
  SparklesIcon,
  RocketLaunchIcon,
  ArrowRightIcon,
  CheckCircleIcon,
  ArrowLeftIcon,
} from '@heroicons/react/24/outline';
import { toast } from 'sonner';

export default function QuestionGuidePage() {
  const t = useTranslations('agreeQuestion.guide');
  const router = useRouter();
  const [isCreating, setIsCreating] = useState(false);

  const handleCreateApp = async () => {
    setIsCreating(true);

    try {
      const response = await fetch('/api/applications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: '你同意吗',
          description: '向好友提问，了解他们的想法',
          type: 'agree_question',
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create application');
      }

      const application = await response.json();
      toast.success(t('toast.createSuccess'));

      // Navigate to run the app
      router.push(`/applications/${application.id}/run`);
    } catch {
      toast.error(t('toast.createError'));
      setIsCreating(false);
    }
  };

  const steps = [
    {
      icon: SparklesIcon,
      title: t('steps.create.title'),
      description: t('steps.create.description'),
      color: 'indigo',
    },
    {
      icon: RocketLaunchIcon,
      title: t('steps.run.title'),
      description: t('steps.run.description'),
      color: 'violet',
    },
    {
      icon: ChatBubbleLeftRightIcon,
      title: t('steps.wait.title'),
      description: t('steps.wait.description'),
      color: 'purple',
    },
  ];

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-gradient-to-br from-indigo-50 via-violet-50 to-purple-50 dark:from-slate-950 dark:via-indigo-950/30 dark:to-slate-950">
      <div className="max-w-3xl mx-auto px-4 py-12">
        {/* Back button */}
        <Button
          variant="ghost"
          size="sm"
          asChild
          className="mb-8 gap-2 text-slate-600 dark:text-slate-400"
        >
          <Link href="/apps/questions">
            <ArrowLeftIcon className="h-4 w-4" />
            {t('backToList')}
          </Link>
        </Button>

        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 mb-6 shadow-xl shadow-indigo-500/25">
            <ChatBubbleLeftRightIcon className="h-10 w-10 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-3">
            {t('title')}
          </h1>
          <p className="text-lg text-slate-600 dark:text-slate-400 max-w-md mx-auto">
            {t('description')}
          </p>
        </div>

        {/* Steps */}
        <div className="space-y-4 mb-12">
          {steps.map((step, index) => (
            <Card
              key={index}
              className={`relative overflow-hidden p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800`}
            >
              <div className="flex items-start gap-4">
                <div className={`flex-shrink-0 w-12 h-12 rounded-xl bg-${step.color}-100 dark:bg-${step.color}-900/30 flex items-center justify-center`}>
                  <step.icon className={`h-6 w-6 text-${step.color}-600 dark:text-${step.color}-400`} />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`text-xs font-semibold text-${step.color}-600 dark:text-${step.color}-400 bg-${step.color}-100 dark:bg-${step.color}-900/30 px-2 py-0.5 rounded-full`}>
                      {t('steps.step')} {index + 1}
                    </span>
                  </div>
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-1">
                    {step.title}
                  </h3>
                  <p className="text-slate-600 dark:text-slate-400">
                    {step.description}
                  </p>
                </div>
                {index < steps.length - 1 && (
                  <ArrowRightIcon className="h-5 w-5 text-slate-300 dark:text-slate-600 absolute right-6 top-1/2 -translate-y-1/2 hidden md:block" />
                )}
              </div>
            </Card>
          ))}
        </div>

        {/* Action buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button
            size="lg"
            onClick={handleCreateApp}
            disabled={isCreating}
            className="gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white shadow-lg shadow-indigo-500/25"
          >
            {isCreating ? (
              <>
                <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                {t('actions.creating')}
              </>
            ) : (
              <>
                <CheckCircleIcon className="h-5 w-5" />
                {t('actions.quickCreate')}
              </>
            )}
          </Button>
          <Button
            size="lg"
            variant="outline"
            asChild
            className="gap-2"
          >
            <Link href="/apps">
              <SparklesIcon className="h-5 w-5" />
              {t('actions.goToApps')}
            </Link>
          </Button>
        </div>

        {/* Tips */}
        <div className="mt-12 p-6 rounded-2xl bg-white/50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800">
          <h3 className="font-semibold text-slate-900 dark:text-white mb-3">
            {t('tips.title')}
          </h3>
          <ul className="space-y-2 text-sm text-slate-600 dark:text-slate-400">
            <li className="flex items-start gap-2">
              <span className="text-indigo-500">•</span>
              {t('tips.tip1')}
            </li>
            <li className="flex items-start gap-2">
              <span className="text-violet-500">•</span>
              {t('tips.tip2')}
            </li>
            <li className="flex items-start gap-2">
              <span className="text-purple-500">•</span>
              {t('tips.tip3')}
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
