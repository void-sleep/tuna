'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { XMarkIcon, CheckIcon, ClockIcon, ChatBubbleLeftIcon } from '@heroicons/react/24/outline';
import { answerQuestionAction } from '@/app/actions/agree-questions';
import type { AgreeQuestionWithUsers } from '@/lib/types/doyouagree';
import { toast } from 'sonner';
import Link from 'next/link';
import { useTranslations } from 'next-intl';

interface QuestionSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  questions: AgreeQuestionWithUsers[];
  onQuestionAnswered: () => void;
}

export function QuestionSidebar({
  isOpen,
  onClose,
  questions,
  onQuestionAnswered,
}: QuestionSidebarProps) {
  const t = useTranslations('agreeQuestion');

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* 遮罩层 */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 z-50"
          />

          {/* 侧边栏 */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="fixed right-0 top-0 h-full w-[85%] max-w-md bg-white dark:bg-slate-900 shadow-2xl z-50 flex flex-col"
          >
            {/* 标题栏 */}
            <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-700">
              <h2 className="text-lg font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                <ChatBubbleLeftIcon className="w-5 h-5 text-violet-500" />
                {t('sidebar.title')} ({questions.length})
              </h2>
              <button
                onClick={onClose}
                className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <XMarkIcon className="w-5 h-5 text-slate-500" />
              </button>
            </div>

            {/* 问题列表 */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {questions.length === 0 ? (
                <EmptyState onClose={onClose} />
              ) : (
                questions.map((question) => (
                  <QuestionCard
                    key={question.id}
                    question={question}
                    onAnswered={onQuestionAnswered}
                  />
                ))
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

function EmptyState({ onClose }: { onClose: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex flex-col items-center justify-center py-12 text-center"
    >
      <div className="w-16 h-16 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center mb-4">
        <CheckIcon className="w-8 h-8 text-green-600 dark:text-green-400" />
      </div>
      <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-2">
        全部处理完毕
      </h3>
      <p className="text-slate-500 dark:text-slate-400 mb-4">
        暂时没有待回答的问题
      </p>
      <button
        onClick={onClose}
        className="px-4 py-2 bg-violet-500 text-white rounded-lg hover:bg-violet-600 transition-colors"
      >
        关闭
      </button>
    </motion.div>
  );
}

interface QuestionCardProps {
  question: AgreeQuestionWithUsers;
  onAnswered: () => void;
}

function QuestionCard({ question, onAnswered }: QuestionCardProps) {
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isAnswered, setIsAnswered] = useState(false);

  const fromUser = question.from_user;
  const initial = (fromUser.full_name || fromUser.email || '?')[0]?.toUpperCase() || '?';
  const displayName = fromUser.full_name || fromUser.email || '未知用户';
  const options = question.options as string[];

  // 计算相对时间
  const createdAt = new Date(question.created_at);
  const now = new Date();
  const diffMs = now.getTime() - createdAt.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  let timeAgo = '';
  if (diffMins < 1) {
    timeAgo = '刚刚';
  } else if (diffMins < 60) {
    timeAgo = `${diffMins}分钟前`;
  } else if (diffHours < 24) {
    timeAgo = `${diffHours}小时前`;
  } else {
    timeAgo = `${diffDays}天前`;
  }

  const handleSubmit = async () => {
    if (!selectedOption) return;

    setIsSubmitting(true);
    const result = await answerQuestionAction({
      questionId: question.id,
      answer: selectedOption,
    });

    if (result.success) {
      setIsAnswered(true);
      toast.success('回答成功');
      // 延迟后通知父组件刷新
      setTimeout(() => {
        onAnswered();
      }, 500);
    } else {
      toast.error(result.error || '回答失败');
    }
    setIsSubmitting(false);
  };

  // 已回答状态 - 显示动画然后消失
  if (isAnswered) {
    return (
      <motion.div
        initial={{ opacity: 1, height: 'auto' }}
        animate={{ opacity: 0, height: 0, marginBottom: 0 }}
        transition={{ duration: 0.3, delay: 0.2 }}
        className="overflow-hidden"
      >
        <div className="bg-green-50 dark:bg-green-900/20 rounded-xl p-4 flex items-center justify-center">
          <CheckIcon className="w-6 h-6 text-green-500 mr-2" />
          <span className="text-green-600 dark:text-green-400">已回答</span>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-slate-50 dark:bg-slate-800 rounded-xl p-4 space-y-4"
    >
      {/* 发问者信息 */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full overflow-hidden ring-2 ring-white dark:ring-slate-700 shadow">
          {fromUser.avatar_url ? (
            <Image
              src={fromUser.avatar_url}
              alt={displayName}
              width={40}
              height={40}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center">
              <span className="text-sm font-bold text-white">{initial}</span>
            </div>
          )}
        </div>
        <div className="flex-1">
          <p className="font-medium text-slate-900 dark:text-white">{displayName}</p>
          <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1">
            <ClockIcon className="w-3 h-3" />
            {timeAgo}
          </p>
        </div>
      </div>

      {/* 问题内容 */}
      <p className="text-slate-800 dark:text-slate-200 font-medium">
        {question.question_text}
      </p>

      {/* 选项列表 */}
      <div className="space-y-2">
        {options.map((option, index) => (
          <button
            key={index}
            onClick={() => setSelectedOption(option)}
            disabled={isSubmitting}
            className={`w-full p-3 rounded-lg border-2 text-left transition-all ${
              selectedOption === option
                ? 'border-violet-500 bg-violet-50 dark:bg-violet-900/30 text-violet-700 dark:text-violet-300'
                : 'border-slate-200 dark:border-slate-600 hover:border-violet-300 dark:hover:border-violet-700'
            }`}
          >
            <span className="flex items-center gap-2">
              <span
                className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                  selectedOption === option
                    ? 'border-violet-500 bg-violet-500'
                    : 'border-slate-300 dark:border-slate-500'
                }`}
              >
                {selectedOption === option && (
                  <CheckIcon className="w-3 h-3 text-white" />
                )}
              </span>
              <span className="text-slate-700 dark:text-slate-200">{option}</span>
            </span>
          </button>
        ))}
      </div>

      {/* 提交按钮 */}
      <button
        onClick={handleSubmit}
        disabled={!selectedOption || isSubmitting}
        className={`w-full py-3 rounded-lg font-medium transition-all ${
          selectedOption && !isSubmitting
            ? 'bg-gradient-to-r from-violet-500 to-purple-600 text-white hover:from-violet-600 hover:to-purple-700 shadow-lg'
            : 'bg-slate-200 dark:bg-slate-700 text-slate-400 dark:text-slate-500 cursor-not-allowed'
        }`}
      >
        {isSubmitting ? '提交中...' : '确认回答'}
      </button>

      {/* 查看完整历史链接 */}
      <Link
        href={`/apps/friends/${fromUser.id}`}
        className="block text-center text-sm text-violet-600 dark:text-violet-400 hover:underline"
      >
        查看我们的完整历史 →
      </Link>
    </motion.div>
  );
}
