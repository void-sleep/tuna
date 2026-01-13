'use client';

import { useState, useMemo } from 'react';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeftIcon,
  ChatBubbleLeftIcon,
  CheckIcon,
  ClockIcon,
  PlusIcon,
} from '@heroicons/react/24/outline';
import { answerQuestionAction } from '@/app/actions/agree-questions';
import type { AgreeQuestionWithUsers, UserProfile } from '@/lib/types/doyouagree';
import { toast } from 'sonner';

interface FriendTimelineClientProps {
  friend: UserProfile;
  questions: AgreeQuestionWithUsers[];
  totalCount: number;
}

export function FriendTimelineClient({
  friend,
  questions: initialQuestions,
  totalCount,
}: FriendTimelineClientProps) {
  const t = useTranslations('agreeQuestion.timeline');
  const [questions, setQuestions] = useState(initialQuestions);

  const friendName = friend.full_name || friend.email || '好友';
  const initial = friendName[0]?.toUpperCase() || '?';

  // Group questions by month
  const groupedQuestions = useMemo(() => {
    const groups: Record<string, AgreeQuestionWithUsers[]> = {};

    questions.forEach((q) => {
      const date = new Date(q.created_at);
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      if (!groups[key]) {
        groups[key] = [];
      }
      groups[key].push(q);
    });

    // Sort by date descending
    return Object.entries(groups).sort((a, b) => b[0].localeCompare(a[0]));
  }, [questions]);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-white/80 dark:bg-slate-900/80 backdrop-blur-lg border-b border-slate-200 dark:border-slate-700">
        <div className="max-w-2xl mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Link
              href="/apps/friends"
              className="p-2 -ml-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <ArrowLeftIcon className="w-5 h-5 text-slate-600 dark:text-slate-400" />
            </Link>

            <div className="flex items-center gap-3 flex-1">
              {/* Avatar */}
              <div className="w-12 h-12 rounded-full overflow-hidden ring-2 ring-violet-200 dark:ring-violet-800 shadow">
                {friend.avatar_url ? (
                  <Image
                    src={friend.avatar_url}
                    alt={friendName}
                    width={48}
                    height={48}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center">
                    <span className="text-lg font-bold text-white">{initial}</span>
                  </div>
                )}
              </div>

              {/* Info */}
              <div>
                <h1 className="font-semibold text-slate-900 dark:text-white">
                  {friendName}
                </h1>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  {t('friend')} · {totalCount} {t('interactions')}
                </p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-2xl mx-auto px-4 py-6 pb-24">
        {questions.length === 0 ? (
          <EmptyState friendName={friendName} />
        ) : (
          <div className="space-y-8">
            {groupedQuestions.map(([monthKey, monthQuestions]) => (
              <MonthGroup
                key={monthKey}
                monthKey={monthKey}
                questions={monthQuestions}
                friend={friend}
                onQuestionAnswered={(id, answer) => {
                  setQuestions((prev) =>
                    prev.map((q) =>
                      q.id === id ? { ...q, answer, status: 'answered' as const, answered_at: new Date().toISOString() } : q
                    )
                  );
                }}
              />
            ))}
          </div>
        )}
      </main>

      {/* Fixed bottom button */}
      <div className="fixed bottom-6 left-0 right-0 flex justify-center">
        <Link
          href="/apps/questions/guide"
          className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-violet-500 to-purple-600 text-white rounded-full shadow-lg hover:from-violet-600 hover:to-purple-700 transition-all"
        >
          <ChatBubbleLeftIcon className="w-5 h-5" />
          <span>向 {friendName} 提问</span>
        </Link>
      </div>
    </div>
  );
}

function EmptyState({
  friendName,
}: {
  friendName: string;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="w-20 h-20 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-4">
        <ChatBubbleLeftIcon className="w-10 h-10 text-slate-400" />
      </div>
      <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-2">
        还没有问答记录
      </h3>
      <p className="text-slate-500 dark:text-slate-400 mb-6">
        向 {friendName} 发起第一个问题吧
      </p>
      <Link
        href="/apps/questions/guide"
        className="flex items-center gap-2 px-4 py-2 bg-violet-500 text-white rounded-lg hover:bg-violet-600 transition-colors"
      >
        <PlusIcon className="w-4 h-4" />
        <span>发起提问</span>
      </Link>
    </div>
  );
}

interface MonthGroupProps {
  monthKey: string;
  questions: AgreeQuestionWithUsers[];
  friend: UserProfile;
  onQuestionAnswered: (id: string, answer: string) => void;
}

function MonthGroup({ monthKey, questions, friend, onQuestionAnswered }: MonthGroupProps) {
  const [year, month] = monthKey.split('-');
  const monthName = new Date(parseInt(year), parseInt(month) - 1).toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
  });

  return (
    <div>
      <h2 className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-4 sticky top-20 bg-slate-50/80 dark:bg-slate-900/80 backdrop-blur py-2">
        {monthName}
      </h2>
      <div className="space-y-4">
        {questions.map((question) => (
          <TimelineCard
            key={question.id}
            question={question}
            friend={friend}
            onAnswered={onQuestionAnswered}
          />
        ))}
      </div>
    </div>
  );
}

interface TimelineCardProps {
  question: AgreeQuestionWithUsers;
  friend: UserProfile;
  onAnswered: (id: string, answer: string) => void;
}

function TimelineCard({ question, friend, onAnswered }: TimelineCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isFromMe = question.from_user.id !== friend.id;
  const isPending = question.status === 'pending';
  const canAnswer = isPending && !isFromMe;
  const options = question.options as string[];

  const date = new Date(question.created_at);
  const dateStr = date.toLocaleDateString('zh-CN', { month: 'numeric', day: 'numeric' });

  const handleSubmit = async () => {
    if (!selectedOption) return;

    setIsSubmitting(true);
    const result = await answerQuestionAction({
      questionId: question.id,
      answer: selectedOption,
    });

    if (result.success) {
      toast.success('回答成功');
      onAnswered(question.id, selectedOption);
      setIsExpanded(false);
    } else {
      toast.error(result.error || '回答失败');
    }
    setIsSubmitting(false);
  };

  return (
    <motion.div
      layout
      className={`rounded-xl p-4 ${
        isFromMe
          ? 'bg-violet-50 dark:bg-violet-900/20 border border-violet-200 dark:border-violet-800'
          : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700'
      }`}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-2 text-sm">
          <span className={isFromMe ? 'text-violet-600 dark:text-violet-400' : 'text-slate-600 dark:text-slate-400'}>
            {isFromMe ? '你问' : `${friend.full_name || '好友'}问`}
          </span>
          <span className="text-slate-400 dark:text-slate-500">·</span>
          <span className="text-slate-400 dark:text-slate-500">{dateStr}</span>
        </div>

        {isPending ? (
          <span className="flex items-center gap-1 text-xs text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/30 px-2 py-0.5 rounded-full">
            <ClockIcon className="w-3 h-3" />
            等待回答
          </span>
        ) : (
          <span className="flex items-center gap-1 text-xs text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/30 px-2 py-0.5 rounded-full">
            <CheckIcon className="w-3 h-3" />
            已回答
          </span>
        )}
      </div>

      {/* Question */}
      <p
        className="text-slate-800 dark:text-slate-200 font-medium cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        {question.question_text}
      </p>

      {/* Answer or Pending */}
      <AnimatePresence>
        {(isExpanded || question.answer) && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-3 overflow-hidden"
          >
            {question.answer ? (
              <div className="flex items-center gap-2 text-sm">
                <span className="text-slate-500 dark:text-slate-400">
                  {isFromMe ? `${friend.full_name || '好友'}答：` : '你答：'}
                </span>
                <span className="font-medium text-violet-600 dark:text-violet-400 bg-violet-100 dark:bg-violet-900/40 px-2 py-0.5 rounded">
                  {question.answer}
                </span>
              </div>
            ) : canAnswer ? (
              <div className="space-y-3">
                <div className="space-y-2">
                  {options.map((option, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedOption(option)}
                      disabled={isSubmitting}
                      className={`w-full p-2 rounded-lg border text-left text-sm transition-all ${
                        selectedOption === option
                          ? 'border-violet-500 bg-violet-50 dark:bg-violet-900/30 text-violet-700 dark:text-violet-300'
                          : 'border-slate-200 dark:border-slate-600 hover:border-violet-300'
                      }`}
                    >
                      {option}
                    </button>
                  ))}
                </div>
                <button
                  onClick={handleSubmit}
                  disabled={!selectedOption || isSubmitting}
                  className={`w-full py-2 rounded-lg text-sm font-medium transition-all ${
                    selectedOption && !isSubmitting
                      ? 'bg-violet-500 text-white hover:bg-violet-600'
                      : 'bg-slate-200 dark:bg-slate-700 text-slate-400 cursor-not-allowed'
                  }`}
                >
                  {isSubmitting ? '提交中...' : '确认回答'}
                </button>
              </div>
            ) : (
              <div className="text-sm text-slate-500 dark:text-slate-400">
                选项：{options.join(' / ')}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
