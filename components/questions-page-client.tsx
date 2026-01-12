'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { PlusIcon } from '@heroicons/react/24/outline';
import { QuestionCard } from '@/components/question-card';
import { AnswerDialog } from '@/components/answer-dialog';
import { CreateQuestionDialog } from '@/components/create-question-dialog';
import type { AgreeQuestionWithUsers, FriendWithUser } from '@/lib/types/doyouagree';
import { useRouter } from 'next/navigation';

interface QuestionsPageClientProps {
  sentQuestions: AgreeQuestionWithUsers[];
  receivedQuestions: AgreeQuestionWithUsers[];
  friends: FriendWithUser[];
  applicationTitle?: string;
}

export function QuestionsPageClient({
  sentQuestions: initialSent,
  receivedQuestions: initialReceived,
  friends,
  applicationTitle,
}: QuestionsPageClientProps) {
  const t = useTranslations('questions');
  const router = useRouter();
  const [sentQuestions] = useState(initialSent);
  const [receivedQuestions] = useState(initialReceived);
  const [selectedQuestion, setSelectedQuestion] = useState<AgreeQuestionWithUsers | null>(null);
  const [answerDialogOpen, setAnswerDialogOpen] = useState(false);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);

  const handleAnswer = (questionId: string) => {
    const question = receivedQuestions.find((q) => q.id === questionId);
    if (question) {
      setSelectedQuestion(question);
      setAnswerDialogOpen(true);
    }
  };

  const handleAnswered = () => {
    // Refresh the page to get updated data
    router.refresh();
  };

  const handleQuestionCreated = () => {
    // Refresh the page to get updated data
    router.refresh();
  };

  return (
    <div className="container max-w-6xl py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">{t('title')}</h1>
          <p className="text-slate-600 dark:text-slate-400 mt-1">
            {applicationTitle ? `${applicationTitle} 的提问` : t('myQuestions')}
          </p>
        </div>
        <Button onClick={() => setCreateDialogOpen(true)} className="gap-2">
          <PlusIcon className="h-4 w-4" />
          {t('createQuestion')}
        </Button>
      </div>

      <Tabs defaultValue="received" className="w-full">
        <TabsList className="w-full max-w-md">
          <TabsTrigger value="received" className="flex-1">
            {t('received')} ({receivedQuestions.length})
          </TabsTrigger>
          <TabsTrigger value="sent" className="flex-1">
            {t('sent')} ({sentQuestions.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="received" className="mt-6">
          {receivedQuestions.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-slate-500 dark:text-slate-400">{t('noReceivedQuestions')}</p>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {receivedQuestions.map((question) => (
                <QuestionCard key={question.id} question={question} type="received" onAnswer={handleAnswer} />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="sent" className="mt-6">
          {sentQuestions.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-slate-500 dark:text-slate-400">{t('noSentQuestions')}</p>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {sentQuestions.map((question) => (
                <QuestionCard key={question.id} question={question} type="sent" />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      <AnswerDialog
        question={selectedQuestion}
        open={answerDialogOpen}
        onOpenChange={setAnswerDialogOpen}
        onAnswered={handleAnswered}
      />

      <CreateQuestionDialog
        friends={friends}
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
        onCreated={handleQuestionCreated}
      />
    </div>
  );
}
