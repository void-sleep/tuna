'use client';

import { useTranslations } from 'next-intl';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CheckCircleIcon, ClockIcon, XCircleIcon } from '@heroicons/react/24/outline';
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

  const statusConfig = {
    pending: {
      badge: 'bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-300 border-amber-200 dark:border-amber-800',
      icon: ClockIcon,
      iconColor: 'text-amber-500',
    },
    answered: {
      badge: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800',
      icon: CheckCircleIcon,
      iconColor: 'text-emerald-500',
    },
    expired: {
      badge: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400 border-slate-200 dark:border-slate-700',
      icon: XCircleIcon,
      iconColor: 'text-slate-400',
    },
  };

  const config = statusConfig[question.status];
  const StatusIcon = config.icon;

  const displayUser = type === 'sent' ? question.to_user : question.from_user;
  const timeText =
    question.status === 'answered' && question.answered_at
      ? formatDistanceToNow(new Date(question.answered_at), { addSuffix: true, locale: dateLocale })
      : formatDistanceToNow(new Date(question.created_at), { addSuffix: true, locale: dateLocale });

  // Generate gradient colors based on user name/email
  const getAvatarGradient = (name: string) => {
    const gradients = [
      'from-violet-500 to-purple-600',
      'from-indigo-500 to-blue-600',
      'from-cyan-500 to-teal-600',
      'from-emerald-500 to-green-600',
      'from-amber-500 to-orange-600',
      'from-rose-500 to-pink-600',
    ];
    const index = name.charCodeAt(0) % gradients.length;
    return gradients[index];
  };

  const avatarGradient = getAvatarGradient(displayUser.full_name || displayUser.email || '?');

  return (
    <Card className="group p-5 bg-white dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/50 hover:border-indigo-300 dark:hover:border-indigo-700 hover:shadow-lg hover:shadow-indigo-500/10 transition-all duration-300 rounded-xl overflow-hidden">
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            {/* Avatar with gradient */}
            <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${avatarGradient} flex items-center justify-center flex-shrink-0 shadow-md`}>
              <span className="text-sm font-bold text-white">
                {(displayUser.full_name || displayUser.email || '?')[0].toUpperCase()}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-slate-900 dark:text-white truncate">
                {displayUser.full_name || displayUser.email}
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1">
                <StatusIcon className={`h-3.5 w-3.5 ${config.iconColor}`} />
                {timeText}
              </p>
            </div>
          </div>
          <Badge className={`${config.badge} border text-xs font-medium px-2.5 py-0.5`}>
            {t(question.status)}
          </Badge>
        </div>

        {/* Question Text */}
        <div className="pl-14">
          <p className="text-slate-700 dark:text-slate-300 text-sm leading-relaxed">
            {question.question_text}
          </p>
        </div>

        {/* Answer or Action */}
        {question.status === 'answered' && question.answer ? (
          <div className="pl-14 pt-3 border-t border-slate-100 dark:border-slate-700/50">
            <div className="flex items-start gap-2">
              <div className="w-6 h-6 rounded-lg bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center flex-shrink-0">
                <CheckCircleIcon className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">
                  {type === 'sent' ? t('theirAnswer') : t('yourAnswer')}
                </p>
                <p className="text-sm font-medium text-indigo-600 dark:text-indigo-400 break-words">
                  {question.answer}
                </p>
              </div>
            </div>
          </div>
        ) : question.status === 'pending' && type === 'received' ? (
          <div className="pl-14 pt-3">
            <Button
              size="sm"
              onClick={() => onAnswer?.(question.id)}
              className="w-full gap-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg shadow-md shadow-indigo-500/20 hover:shadow-lg hover:shadow-indigo-500/30 transition-all"
            >
              {t('answer')}
            </Button>
          </div>
        ) : question.status === 'pending' && type === 'sent' ? (
          <div className="pl-14 pt-3">
            <div className="flex items-center gap-2 text-xs text-amber-600 dark:text-amber-400">
              <ClockIcon className="h-4 w-4" />
              <span>等待对方回答...</span>
            </div>
          </div>
        ) : null}
      </div>
    </Card>
  );
}
