'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { getPendingQuestionsAction } from '@/app/actions/agree-questions';
import type { AgreeQuestionWithUsers } from '@/lib/types/doyouagree';
import { QuestionSidebar } from './question-sidebar';

interface FloatingBubbleProps {
  /** 初始延迟（毫秒），登录后等待多久显示气泡 */
  initialDelay?: number;
  /** 展开状态持续时间（毫秒），之后自动收起 */
  expandDuration?: number;
}

export function FloatingBubble({
  initialDelay = 500,
  expandDuration = 3000,
}: FloatingBubbleProps) {
  const [questions, setQuestions] = useState<AgreeQuestionWithUsers[]>([]);
  const [count, setCount] = useState(0);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isVisible] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // 获取未答问题
  const fetchPendingQuestions = useCallback(async () => {
    try {
      const result = await getPendingQuestionsAction();
      setQuestions(result.questions);
      setCount(result.count);
    } catch (error) {
      console.error('Failed to fetch pending questions:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // 初始加载
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchPendingQuestions();
    }, initialDelay);

    return () => clearTimeout(timer);
  }, [fetchPendingQuestions, initialDelay]);

  // 展开后自动收起
  useEffect(() => {
    if (isExpanded && count > 0) {
      const timer = setTimeout(() => {
        setIsExpanded(false);
      }, expandDuration);

      return () => clearTimeout(timer);
    }
  }, [isExpanded, count, expandDuration]);

  // 首次加载完成后展开
  useEffect(() => {
    if (!isLoading && count > 0) {
      setIsExpanded(true);
    }
  }, [isLoading, count]);

  // 处理问题回答后刷新
  const handleQuestionAnswered = useCallback(() => {
    fetchPendingQuestions();
  }, [fetchPendingQuestions]);

  // 如果没有未答问题或被隐藏，不显示
  if (count === 0 || !isVisible) {
    return null;
  }

  // 最新问题的发问者
  const latestQuestion = questions[0];
  const latestAvatar = latestQuestion?.from_user?.avatar_url;
  const latestName = latestQuestion?.from_user?.full_name || latestQuestion?.from_user?.email || '?';
  const initial = latestName[0]?.toUpperCase() || '?';

  return (
    <>
      {/* 浮动气泡 */}
      <AnimatePresence>
        <motion.div
          className="fixed right-0 top-1/2 -translate-y-1/2 z-50"
          initial={{ x: 100, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: 100, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        >
          <motion.button
            onClick={() => setIsSidebarOpen(true)}
            onMouseEnter={() => setIsExpanded(true)}
            className="relative flex items-center"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {/* 收起状态：贴边小圆点 */}
            <AnimatePresence mode="wait">
              {!isExpanded ? (
                <motion.div
                  key="collapsed"
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.5 }}
                  className="relative"
                >
                  {/* 小圆点 */}
                  <div className="w-4 h-12 bg-violet-500 rounded-l-full shadow-lg flex items-center justify-center">
                    <span className="sr-only">未读问题</span>
                  </div>
                  {/* 红色角标 */}
                  <div className="absolute -top-1 -left-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center text-white text-xs font-bold shadow-md">
                    {count > 9 ? '9+' : count}
                  </div>
                </motion.div>
              ) : (
                /* 展开状态：头像 + 角标 */
                <motion.div
                  key="expanded"
                  initial={{ opacity: 0, scale: 0.5, x: 20 }}
                  animate={{ opacity: 1, scale: 1, x: 0 }}
                  exit={{ opacity: 0, scale: 0.5, x: 20 }}
                  className="relative mr-2"
                >
                  {/* 头像 */}
                  <div className="w-14 h-14 rounded-full shadow-lg overflow-hidden ring-2 ring-white dark:ring-slate-800">
                    {latestAvatar ? (
                      <Image
                        src={latestAvatar}
                        alt={latestName}
                        width={56}
                        height={56}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center">
                        <span className="text-xl font-bold text-white">{initial}</span>
                      </div>
                    )}
                  </div>
                  {/* 红色角标 */}
                  <div className="absolute -top-1 -right-1 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center text-white text-xs font-bold shadow-md animate-pulse">
                    {count > 9 ? '9+' : count}
                  </div>
                  {/* 呼吸动画光环 */}
                  <div className="absolute inset-0 rounded-full animate-ping bg-violet-400 opacity-20" />
                </motion.div>
              )}
            </AnimatePresence>
          </motion.button>
        </motion.div>
      </AnimatePresence>

      {/* 问答侧边栏 */}
      <QuestionSidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        questions={questions}
        onQuestionAnswered={handleQuestionAnswered}
      />
    </>
  );
}
