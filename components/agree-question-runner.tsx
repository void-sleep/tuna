'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { PaperAirplaneIcon, PlusIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { toast } from 'sonner';
import { getFriendsAction } from '@/app/actions/friends';
import { createAgreeQuestionAction, getMyQuestionsAction } from '@/app/actions/agree-questions';
import type { FriendWithUser, AgreeQuestionWithUsers } from '@/lib/types/doyouagree';
import { formatDistanceToNow } from 'date-fns';
import { zhCN, enUS } from 'date-fns/locale';

interface AgreeQuestionRunnerProps {
  applicationId: string;
  defaultQuestion?: string;
  defaultOptions?: string[];
}

export function AgreeQuestionRunner({
  applicationId,
  defaultQuestion = '',
  defaultOptions = ['同意', '不同意']
}: AgreeQuestionRunnerProps) {
  const t = useTranslations('agreeQuestion.run');
  const [friends, setFriends] = useState<FriendWithUser[]>([]);
  const [questions, setQuestions] = useState<{ sent: AgreeQuestionWithUsers[]; received: AgreeQuestionWithUsers[] }>({ sent: [], received: [] });
  const [selectedFriendId, setSelectedFriendId] = useState<string>('');
  const [questionText, setQuestionText] = useState(defaultQuestion);
  const [options, setOptions] = useState<string[]>(defaultOptions);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    loadFriends();
    loadQuestions();
  }, []);

  const loadFriends = async () => {
    const friendsList = await getFriendsAction();
    setFriends(friendsList);
  };

  const loadQuestions = async () => {
    const questionsData = await getMyQuestionsAction();
    setQuestions(questionsData);
  };

  const handleAddOption = () => {
    if (options.length < 5) {
      setOptions([...options, '']);
    }
  };

  const handleRemoveOption = (index: number) => {
    if (options.length > 2) {
      setOptions(options.filter((_, i) => i !== index));
    }
  };

  const handleOptionChange = (index: number, value: string) => {
    const newOptions = [...options];
    newOptions[index] = value;
    setOptions(newOptions);
  };

  const handleSendQuestion = async () => {
    if (!selectedFriendId) {
      toast.error(t('errors.noFriend'));
      return;
    }

    if (!questionText.trim()) {
      toast.error(t('errors.noQuestion'));
      return;
    }

    const validOptions = options.filter(opt => opt.trim());
    if (validOptions.length < 2) {
      toast.error(t('errors.notEnoughOptions'));
      return;
    }

    setIsLoading(true);
    const result = await createAgreeQuestionAction({
      applicationId: applicationId,
      toUserId: selectedFriendId,
      questionText: questionText,
      options: validOptions,
    });

    if (result.success) {
      toast.success(t('success'));
      setQuestionText(defaultQuestion);
      setOptions(defaultOptions);
      setSelectedFriendId('');
      loadQuestions();
    } else {
      toast.error(result.error || t('errors.sendFailed'));
    }
    setIsLoading(false);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge className="bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300">待回答</Badge>;
      case 'answered':
        return <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">已回答</Badge>;
      case 'expired':
        return <Badge className="bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300">已过期</Badge>;
      default:
        return null;
    }
  };

  const locale = t('locale') === 'zh-CN' ? zhCN : enUS;

  return (
    <div className="space-y-8">
      {/* Send Question Card */}
      <Card className="p-6 bg-gradient-to-br from-indigo-50/50 to-purple-50/50 dark:from-indigo-950/20 dark:to-purple-950/20 border-2 border-indigo-200 dark:border-indigo-900">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <span className="text-2xl">💭</span>
          {t('sendQuestion.title')}
        </h3>

        <div className="space-y-4">
          {/* Select Friend */}
          <div>
            <Label htmlFor="friend">{t('sendQuestion.selectFriend')}</Label>
            <Select value={selectedFriendId} onValueChange={setSelectedFriendId}>
              <SelectTrigger id="friend" className="mt-2">
                <SelectValue placeholder={t('sendQuestion.selectFriendPlaceholder')} />
              </SelectTrigger>
              <SelectContent>
                {friends.map((friendship) => {
                  const friend = friendship.friend;
                  return (
                    <SelectItem key={friend.id} value={friend.id}>
                      {friend.full_name}
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
          </div>

          {/* Question Text */}
          <div>
            <Label htmlFor="question">{t('sendQuestion.question')}</Label>
            <Textarea
              id="question"
              value={questionText}
              onChange={(e) => setQuestionText(e.target.value)}
              placeholder={t('sendQuestion.questionPlaceholder')}
              rows={3}
              className="mt-2 resize-none"
            />
          </div>

          {/* Options */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <Label>{t('sendQuestion.options')}</Label>
              {options.length < 5 && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={handleAddOption}
                  className="h-8 gap-1 text-xs"
                >
                  <PlusIcon className="h-3 w-3" />
                  {t('sendQuestion.addOption')}
                </Button>
              )}
            </div>
            <div className="space-y-2">
              {options.map((option, index) => (
                <div key={index} className="flex items-center gap-2">
                  <Input
                    value={option}
                    onChange={(e) => handleOptionChange(index, e.target.value)}
                    placeholder={`${t('sendQuestion.option')} ${index + 1}`}
                  />
                  {options.length > 2 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveOption(index)}
                      className="h-9 w-9 p-0"
                    >
                      <XMarkIcon className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Send Button */}
          <Button
            onClick={handleSendQuestion}
            disabled={isLoading}
            className="w-full gap-2 bg-indigo-600 hover:bg-indigo-500 text-white"
          >
            <PaperAirplaneIcon className="h-4 w-4" />
            {isLoading ? t('sendQuestion.sending') : t('sendQuestion.send')}
          </Button>
        </div>
      </Card>

      {/* Questions History */}
      <div className="space-y-6">
        <h3 className="text-xl font-semibold">{t('history.title')}</h3>

        {/* Sent Questions */}
        {questions.sent.length > 0 && (
          <div>
            <h4 className="text-sm font-semibold text-muted-foreground mb-3">{t('history.sent')}</h4>
            <div className="space-y-3">
              {questions.sent.map((q) => (
                <Card key={q.id} className="p-4">
                  <div className="flex items-start justify-between gap-4 mb-2">
                    <div className="flex-1">
                      <p className="text-sm text-muted-foreground">
                        {t('history.to')} <span className="font-medium">{q.to_user.full_name}</span>
                      </p>
                      <p className="font-medium mt-1">{q.question_text}</p>
                    </div>
                    {getStatusBadge(q.status)}
                  </div>
                  {q.answer && (
                    <div className="mt-2 p-3 bg-green-50 dark:bg-green-950/20 rounded-lg">
                      <p className="text-sm text-green-800 dark:text-green-300">
                        {t('history.answer')}: <span className="font-medium">{q.answer}</span>
                      </p>
                    </div>
                  )}
                  <p className="text-xs text-muted-foreground mt-2">
                    {formatDistanceToNow(new Date(q.created_at), { addSuffix: true, locale })}
                  </p>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Received Questions */}
        {questions.received.length > 0 && (
          <div>
            <h4 className="text-sm font-semibold text-muted-foreground mb-3">{t('history.received')}</h4>
            <div className="space-y-3">
              {questions.received.map((q) => (
                <Card key={q.id} className="p-4">
                  <div className="flex items-start justify-between gap-4 mb-2">
                    <div className="flex-1">
                      <p className="text-sm text-muted-foreground">
                        {t('history.from')} <span className="font-medium">{q.from_user.full_name}</span>
                      </p>
                      <p className="font-medium mt-1">{q.question_text}</p>
                    </div>
                    {getStatusBadge(q.status)}
                  </div>
                  {q.answer && (
                    <div className="mt-2 p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
                      <p className="text-sm text-blue-800 dark:text-blue-300">
                        {t('history.yourAnswer')}: <span className="font-medium">{q.answer}</span>
                      </p>
                    </div>
                  )}
                  <p className="text-xs text-muted-foreground mt-2">
                    {formatDistanceToNow(new Date(q.created_at), { addSuffix: true, locale })}
                  </p>
                </Card>
              ))}
            </div>
          </div>
        )}

        {questions.sent.length === 0 && questions.received.length === 0 && (
          <Card className="p-8 text-center">
            <div className="text-4xl mb-4">📭</div>
            <p className="text-muted-foreground">{t('history.empty')}</p>
          </Card>
        )}
      </div>
    </div>
  );
}
