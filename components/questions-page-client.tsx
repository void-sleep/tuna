'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  PlusIcon,
  ChatBubbleLeftRightIcon,
  PaperAirplaneIcon,
  InboxArrowDownIcon,
  ArrowLeftIcon,
  SparklesIcon,
} from '@heroicons/react/24/outline';
import { QuestionCard } from '@/components/question-card';
import { AnswerDialog } from '@/components/answer-dialog';
import type { AgreeQuestionWithUsers } from '@/lib/types/doyouagree';

interface QuestionsPageClientProps {
  sentQuestions: AgreeQuestionWithUsers[];
  receivedQuestions: AgreeQuestionWithUsers[];
  applicationTitle?: string;
}

export function QuestionsPageClient({
  sentQuestions: initialSent,
  receivedQuestions: initialReceived,
  applicationTitle,
}: QuestionsPageClientProps) {
  const t = useTranslations('questions');
  const router = useRouter();
  const [sentQuestions] = useState(initialSent);
  const [receivedQuestions] = useState(initialReceived);
  const [selectedQuestion, setSelectedQuestion] = useState<AgreeQuestionWithUsers | null>(null);
  const [answerDialogOpen, setAnswerDialogOpen] = useState(false);

  const handleAnswer = (questionId: string) => {
    const question = receivedQuestions.find((q) => q.id === questionId);
    if (question) {
      setSelectedQuestion(question);
      setAnswerDialogOpen(true);
    }
  };

  const handleAnswered = () => {
    router.refresh();
  };

  const totalCount = sentQuestions.length + receivedQuestions.length;
  const pendingCount = receivedQuestions.filter(q => q.status === 'pending').length;

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-slate-50/50 dark:bg-slate-950">
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-8 space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-3">
            {applicationTitle && (
              <Button
                variant="ghost"
                size="icon"
                asChild
                className="h-10 w-10 rounded-xl"
              >
                <Link href="/apps">
                  <ArrowLeftIcon className="h-5 w-5" />
                </Link>
              </Button>
            )}
            <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center">
              <ChatBubbleLeftRightIcon className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
                {applicationTitle ? `${applicationTitle}` : t('title')}
              </h1>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                {applicationTitle
                  ? `应用的提问记录 · 共 ${totalCount} 条`
                  : totalCount > 0
                  ? `${t('myQuestions')} · 共 ${totalCount} 条`
                  : t('myQuestions')}
              </p>
            </div>
          </div>

          <Button
            asChild
            className="gap-2 bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-500/25 rounded-xl"
          >
            <Link href="/apps/questions/guide">
              <PlusIcon className="h-4 w-4" />
              {t('createQuestion')}
            </Link>
          </Button>
        </div>

        {/* Pending Alert */}
        {pendingCount > 0 && (
          <div className="flex items-center gap-3 p-4 rounded-xl bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/30">
            <SparklesIcon className="h-5 w-5 text-amber-600 dark:text-amber-400" />
            <p className="text-sm text-slate-700 dark:text-slate-300">
              {pendingCount} 个问题待你回答
            </p>
          </div>
        )}

        {/* Main Content */}
        <Card className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
          <Tabs defaultValue="received" className="w-full">
            {/* Tabs Header */}
            <div className="border-b border-slate-200 dark:border-slate-800 px-6 py-4">
              <TabsList className="bg-slate-100 dark:bg-slate-800 p-1 rounded-lg">
                <TabsTrigger
                  value="received"
                  className="flex items-center gap-2 rounded-md data-[state=active]:bg-white dark:data-[state=active]:bg-slate-700 data-[state=active]:shadow-sm px-4"
                >
                  <InboxArrowDownIcon className="h-4 w-4" />
                  {t('received')}
                  {receivedQuestions.length > 0 && (
                    <Badge
                      variant="secondary"
                      className="ml-1 bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 text-xs"
                    >
                      {receivedQuestions.length}
                    </Badge>
                  )}
                </TabsTrigger>
                <TabsTrigger
                  value="sent"
                  className="flex items-center gap-2 rounded-md data-[state=active]:bg-white dark:data-[state=active]:bg-slate-700 data-[state=active]:shadow-sm px-4"
                >
                  <PaperAirplaneIcon className="h-4 w-4" />
                  {t('sent')}
                  {sentQuestions.length > 0 && (
                    <Badge
                      variant="secondary"
                      className="ml-1 bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-400 text-xs"
                    >
                      {sentQuestions.length}
                    </Badge>
                  )}
                </TabsTrigger>
              </TabsList>
            </div>

            {/* Tab Content - Received */}
            <TabsContent value="received" className="m-0">
              {receivedQuestions.length === 0 ? (
                <div className="p-8 sm:p-12 lg:p-16 text-center">
                  <div className="relative inline-block mb-6">
                    <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/20 to-purple-500/20 rounded-full blur-2xl" />
                    <div className="relative w-20 h-20 rounded-full bg-gradient-to-br from-indigo-500/10 to-purple-500/10 border-2 border-dashed border-indigo-500/30 flex items-center justify-center">
                      <InboxArrowDownIcon className="h-10 w-10 text-indigo-400" />
                    </div>
                  </div>
                  <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">
                    {t('noReceivedQuestions')}
                  </h3>
                  <p className="text-slate-600 dark:text-slate-400 max-w-md mx-auto">
                    当好友向你提问时，问题会显示在这里
                  </p>
                </div>
              ) : (
                <div className="p-6">
                  <div className="grid gap-4 md:grid-cols-2">
                    {receivedQuestions.map((question) => (
                      <QuestionCard
                        key={question.id}
                        question={question}
                        type="received"
                        onAnswer={handleAnswer}
                      />
                    ))}
                  </div>
                </div>
              )}
            </TabsContent>

            {/* Tab Content - Sent */}
            <TabsContent value="sent" className="m-0">
              {sentQuestions.length === 0 ? (
                <div className="p-8 sm:p-12 lg:p-16 text-center">
                  <div className="relative inline-block mb-6">
                    <div className="absolute inset-0 bg-gradient-to-br from-violet-500/20 to-pink-500/20 rounded-full blur-2xl" />
                    <div className="relative w-20 h-20 rounded-full bg-gradient-to-br from-violet-500/10 to-pink-500/10 border-2 border-dashed border-violet-500/30 flex items-center justify-center">
                      <PaperAirplaneIcon className="h-10 w-10 text-violet-400" />
                    </div>
                  </div>
                  <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">
                    {t('noSentQuestions')}
                  </h3>
                  <p className="text-slate-600 dark:text-slate-400 max-w-md mx-auto mb-6">
                    先创建一个你同意吗应用，然后运行它来向好友提问
                  </p>
                  <Button
                    asChild
                    variant="outline"
                    className="gap-2 rounded-xl"
                  >
                    <Link href="/apps/questions/guide">
                      <PlusIcon className="h-4 w-4" />
                      {t('createQuestion')}
                    </Link>
                  </Button>
                </div>
              ) : (
                <div className="p-6">
                  <div className="grid gap-4 md:grid-cols-2">
                    {sentQuestions.map((question) => (
                      <QuestionCard key={question.id} question={question} type="sent" />
                    ))}
                  </div>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </Card>

        {/* Quick Stats (when there are questions) */}
        {totalCount > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
              <p className="text-sm text-slate-500 dark:text-slate-400">总提问</p>
              <p className="text-2xl font-bold text-slate-900 dark:text-white">{totalCount}</p>
            </Card>
            <Card className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
              <p className="text-sm text-slate-500 dark:text-slate-400">已发送</p>
              <p className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">{sentQuestions.length}</p>
            </Card>
            <Card className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
              <p className="text-sm text-slate-500 dark:text-slate-400">已收到</p>
              <p className="text-2xl font-bold text-violet-600 dark:text-violet-400">{receivedQuestions.length}</p>
            </Card>
            <Card className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
              <p className="text-sm text-slate-500 dark:text-slate-400">待回答</p>
              <p className="text-2xl font-bold text-amber-600 dark:text-amber-400">{pendingCount}</p>
            </Card>
          </div>
        )}
      </div>

      {/* Dialogs */}
      <AnswerDialog
        question={selectedQuestion}
        open={answerDialogOpen}
        onOpenChange={setAnswerDialogOpen}
        onAnswered={handleAnswered}
      />
    </div>
  );
}
