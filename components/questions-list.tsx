'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  ArrowLeftIcon,
  ChatBubbleLeftRightIcon,
  PaperAirplaneIcon,
  InboxArrowDownIcon,
  FunnelIcon,
  CheckCircleIcon,
  ClockIcon,
  XCircleIcon
} from '@heroicons/react/24/outline';
import type { AgreeQuestionWithUsers } from '@/lib/types/doyouagree';
import { formatDistanceToNow } from 'date-fns';
import { zhCN, enUS } from 'date-fns/locale';

interface QuestionsListProps {
  applicationTitle: string;
  questions: {
    sent: AgreeQuestionWithUsers[];
    received: AgreeQuestionWithUsers[];
  };
}

type FilterType = 'all' | 'sent' | 'received';
type StatusFilter = 'all' | 'pending' | 'answered' | 'expired';

export function QuestionsList({ applicationTitle, questions }: QuestionsListProps) {
  const t = useTranslations('agreeQuestion.run');
  const router = useRouter();
  const [filter, setFilter] = useState<FilterType>('all');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');

  const locale = t('locale') === 'zh-CN' ? zhCN : enUS;

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return (
          <Badge className="bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300 gap-1">
            <ClockIcon className="h-3 w-3" />
            待回答
          </Badge>
        );
      case 'answered':
        return (
          <Badge className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300 gap-1">
            <CheckCircleIcon className="h-3 w-3" />
            已回答
          </Badge>
        );
      case 'expired':
        return (
          <Badge className="bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300 gap-1">
            <XCircleIcon className="h-3 w-3" />
            已过期
          </Badge>
        );
      default:
        return null;
    }
  };

  // Filter questions
  const filteredQuestions = (() => {
    let allQuestions: (AgreeQuestionWithUsers & { type: 'sent' | 'received' })[] = [];

    if (filter === 'all' || filter === 'sent') {
      allQuestions = [...allQuestions, ...questions.sent.map(q => ({ ...q, type: 'sent' as const }))];
    }

    if (filter === 'all' || filter === 'received') {
      allQuestions = [...allQuestions, ...questions.received.map(q => ({ ...q, type: 'received' as const }))];
    }

    // Apply status filter
    if (statusFilter !== 'all') {
      allQuestions = allQuestions.filter(q => q.status === statusFilter);
    }

    // Sort by date
    return allQuestions.sort((a, b) =>
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
  })();

  const stats = {
    total: questions.sent.length + questions.received.length,
    sent: questions.sent.length,
    received: questions.received.length,
    pending: [...questions.sent, ...questions.received].filter(q => q.status === 'pending').length,
    answered: [...questions.sent, ...questions.received].filter(q => q.status === 'answered').length,
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50/30 to-purple-50/30 dark:from-slate-950 dark:via-indigo-950/10 dark:to-purple-950/10">
      <div className="container max-w-6xl px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-6 sm:space-y-8">
        {/* Header */}
        <div className="relative px-2">
          <div className="absolute -top-4 -left-4 w-24 h-24 bg-gradient-to-br from-indigo-500/20 to-purple-500/20 rounded-full blur-3xl" />
          <div className="relative space-y-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push('/apps')}
              className="gap-2 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white mb-4"
            >
              <ArrowLeftIcon className="h-4 w-4" />
              返回应用列表
            </Button>

            <div className="flex items-center gap-3 sm:gap-4">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/25">
                <ChatBubbleLeftRightIcon className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                  提问记录
                </h1>
                <p className="text-slate-600 dark:text-slate-400 mt-1">
                  {applicationTitle}
                </p>
              </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-6">
              <div className="p-3 rounded-xl bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-950/20 dark:to-purple-950/20 border border-indigo-200 dark:border-indigo-900/30">
                <p className="text-2xl font-bold text-indigo-700 dark:text-indigo-400">{stats.total}</p>
                <p className="text-xs text-indigo-600 dark:text-indigo-500">总提问</p>
              </div>
              <div className="p-3 rounded-xl bg-gradient-to-br from-blue-50 to-sky-50 dark:from-blue-950/20 dark:to-sky-950/20 border border-blue-200 dark:border-blue-900/30">
                <p className="text-2xl font-bold text-blue-700 dark:text-blue-400">{stats.sent}</p>
                <p className="text-xs text-blue-600 dark:text-blue-500">已发送</p>
              </div>
              <div className="p-3 rounded-xl bg-gradient-to-br from-orange-50 to-amber-50 dark:from-orange-950/20 dark:to-amber-950/20 border border-orange-200 dark:border-orange-900/30">
                <p className="text-2xl font-bold text-orange-700 dark:text-orange-400">{stats.pending}</p>
                <p className="text-xs text-orange-600 dark:text-orange-500">待回答</p>
              </div>
              <div className="p-3 rounded-xl bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20 border border-green-200 dark:border-green-900/30">
                <p className="text-2xl font-bold text-green-700 dark:text-green-400">{stats.answered}</p>
                <p className="text-xs text-green-600 dark:text-green-500">已回答</p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <Card className="p-4 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Type Filter */}
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <FunnelIcon className="h-4 w-4 text-slate-500" />
                <span className="text-sm font-medium text-slate-700 dark:text-slate-300">类型筛选</span>
              </div>
              <div className="flex gap-2">
                <Button
                  variant={filter === 'all' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setFilter('all')}
                  className="rounded-lg"
                >
                  全部
                </Button>
                <Button
                  variant={filter === 'sent' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setFilter('sent')}
                  className="rounded-lg gap-1"
                >
                  <PaperAirplaneIcon className="h-3 w-3" />
                  已发送
                </Button>
                <Button
                  variant={filter === 'received' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setFilter('received')}
                  className="rounded-lg gap-1"
                >
                  <InboxArrowDownIcon className="h-3 w-3" />
                  已接收
                </Button>
              </div>
            </div>

            {/* Status Filter */}
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <FunnelIcon className="h-4 w-4 text-slate-500" />
                <span className="text-sm font-medium text-slate-700 dark:text-slate-300">状态筛选</span>
              </div>
              <div className="flex gap-2">
                <Button
                  variant={statusFilter === 'all' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setStatusFilter('all')}
                  className="rounded-lg"
                >
                  全部
                </Button>
                <Button
                  variant={statusFilter === 'pending' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setStatusFilter('pending')}
                  className="rounded-lg"
                >
                  待回答
                </Button>
                <Button
                  variant={statusFilter === 'answered' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setStatusFilter('answered')}
                  className="rounded-lg"
                >
                  已回答
                </Button>
              </div>
            </div>
          </div>
        </Card>

        {/* Questions List */}
        <div className="space-y-4">
          {filteredQuestions.length === 0 ? (
            <Card className="p-12 text-center bg-white dark:bg-slate-900">
              <div className="text-6xl mb-4">📭</div>
              <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">
                暂无提问记录
              </h3>
              <p className="text-slate-600 dark:text-slate-400">
                {filter === 'sent' ? '你还没有发送过提问' : filter === 'received' ? '你还没有收到过提问' : '你还没有任何提问记录'}
              </p>
            </Card>
          ) : (
            filteredQuestions.map((q) => (
              <Card key={q.id} className="p-5 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:shadow-lg transition-shadow">
                <div className="flex items-start justify-between gap-4 mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      {q.type === 'sent' ? (
                        <div className="flex items-center gap-1.5 text-sm text-blue-600 dark:text-blue-400">
                          <PaperAirplaneIcon className="h-4 w-4" />
                          <span>发送给</span>
                          <span className="font-semibold">{q.to_user.full_name}</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1.5 text-sm text-purple-600 dark:text-purple-400">
                          <InboxArrowDownIcon className="h-4 w-4" />
                          <span>来自</span>
                          <span className="font-semibold">{q.from_user.full_name}</span>
                        </div>
                      )}
                    </div>
                    <p className="text-lg font-medium text-slate-900 dark:text-white mb-2">
                      {q.question_text}
                    </p>
                    {q.answer && (
                      <div className={`mt-3 p-3 rounded-lg ${
                        q.type === 'sent'
                          ? 'bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-900/30'
                          : 'bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900/30'
                      }`}>
                        <p className={`text-sm ${
                          q.type === 'sent'
                            ? 'text-green-800 dark:text-green-300'
                            : 'text-blue-800 dark:text-blue-300'
                        }`}>
                          <span className="font-medium">
                            {q.type === 'sent' ? 'TA 的回答' : '你的回答'}:
                          </span>{' '}
                          <span className="font-semibold">{q.answer}</span>
                        </p>
                      </div>
                    )}
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    {getStatusBadge(q.status)}
                    <span className="text-xs text-slate-400">
                      {formatDistanceToNow(new Date(q.created_at), { addSuffix: true, locale })}
                    </span>
                  </div>
                </div>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
