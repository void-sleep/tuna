'use client';

import { useTranslations } from 'next-intl';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import type { AgreeQuestionWithUsers } from '@/lib/types/doyouagree';
import { formatDistanceToNow } from 'date-fns';
import { zhCN, enUS } from 'date-fns/locale';
import { useLocale } from 'next-intl';

interface QuestionCardProps {
  question: AgreeQuestionWithUsers;
  type: 'sent' | 'received';
  onAnswer?: (questionId: string) => void;
}

export function QuestionCard({ question, type, onAnswer }: QuestionCardProps) {
  const t = useTranslations('questions');
  const locale = useLocale();
  const dateLocale = locale === 'zh' ? zhCN : enUS;

  const statusColors = {
    pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
    answered: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
    expired: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300',
  };

  const displayUser = type === 'sent' ? question.to_user : question.from_user;
  const timeText =
    question.status === 'answered' && question.answered_at
      ? formatDistanceToNow(new Date(question.answered_at), { addSuffix: true, locale: dateLocale })
      : formatDistanceToNow(new Date(question.created_at), { addSuffix: true, locale: dateLocale });

  return (
    <Card className="p-4 hover:shadow-md transition-shadow">
      <div className="space-y-3">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3 flex-1">
            <div className="w-10 h-10 rounded-full bg-violet-100 dark:bg-violet-900 flex items-center justify-center flex-shrink-0">
              <span className="text-sm font-medium text-violet-600 dark:text-violet-400">
                {displayUser.full_name[0].toUpperCase()}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-slate-900 dark:text-white truncate">
                {displayUser.full_name}
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400">{timeText}</p>
            </div>
          </div>
          <Badge className={statusColors[question.status]}>{t(question.status)}</Badge>
        </div>

        {/* Question */}
        <div className="pt-2">
          <p className="text-slate-700 dark:text-slate-300 text-sm">{question.question_text}</p>
        </div>

        {/* Answer or Options */}
        {question.status === 'answered' && question.answer ? (
          <div className="pt-2 border-t border-slate-200 dark:border-slate-700">
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">
              {type === 'sent' ? t('theirAnswer') : t('yourAnswer')}:
            </p>
            <p className="text-sm font-medium text-violet-600 dark:text-violet-400">{question.answer}</p>
          </div>
        ) : question.status === 'pending' && type === 'received' ? (
          <div className="pt-2">
            <Button size="sm" onClick={() => onAnswer?.(question.id)} className="w-full">
              {t('answer')}
            </Button>
          </div>
        ) : null}
      </div>
    </Card>
  );
}
