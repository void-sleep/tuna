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
import { PaperAirplaneIcon, PlusIcon, XMarkIcon, UserGroupIcon, ChatBubbleLeftRightIcon, CheckCircleIcon } from '@heroicons/react/24/outline';
import { toast } from 'sonner';
import { getFriendsAction } from '@/app/actions/friends';
import { createAgreeQuestionAction } from '@/app/actions/agree-questions';
import type { FriendWithUser } from '@/lib/types/doyouagree';

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
  const [selectedFriendId, setSelectedFriendId] = useState<string>('');
  const [questionText, setQuestionText] = useState(defaultQuestion);
  const [options, setOptions] = useState<string[]>(defaultOptions);
  const [isLoading, setIsLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    loadFriends();
  }, []);

  const loadFriends = async () => {
    const friendsList = await getFriendsAction();
    setFriends(friendsList);
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
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
      toast.success(t('success'));
      setQuestionText(defaultQuestion);
      setOptions(defaultOptions);
      setSelectedFriendId('');
    } else {
      toast.error(result.error || t('errors.sendFailed'));
    }
    setIsLoading(false);
  };

  const selectedFriend = friends.find(f => f.friend.id === selectedFriendId)?.friend;

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-slate-900 via-indigo-950/50 to-slate-900 flex items-center justify-center p-4 overflow-auto">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-20 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl" />
      </div>

      {/* Success overlay */}
      {showSuccess && (
        <div className="absolute inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 animate-in fade-in duration-300">
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-8 max-w-sm mx-4 text-center shadow-2xl animate-in zoom-in duration-300">
            <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center">
              <CheckCircleIcon className="h-10 w-10 text-white" />
            </div>
            <h3 className="text-2xl font-bold mb-2 text-slate-900 dark:text-white">发送成功！</h3>
            <p className="text-slate-600 dark:text-slate-400">
              你的问题已经发送给 <span className="font-semibold text-indigo-600 dark:text-indigo-400">{selectedFriend?.full_name}</span>
            </p>
          </div>
        </div>
      )}

      <div className="relative w-full max-w-2xl">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 mb-4 shadow-lg shadow-indigo-500/25">
            <ChatBubbleLeftRightIcon className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent mb-2">
            {t('sendQuestion.title')}
          </h1>
          <p className="text-indigo-300/60">
            向好友提问，获取他们的真实想法
          </p>
        </div>

        {/* Main Card */}
        <Card className="relative overflow-hidden bg-white/10 dark:bg-slate-800/40 backdrop-blur-xl border-2 border-indigo-500/20 shadow-2xl">
          {/* Card decoration */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-indigo-500/10 to-purple-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />

          <div className="relative p-8 space-y-6">
            {/* Select Friend Section */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                  <UserGroupIcon className="h-4 w-4 text-white" />
                </div>
                <Label htmlFor="friend" className="text-base font-semibold text-white">
                  {t('sendQuestion.selectFriend')}
                </Label>
              </div>
              <Select value={selectedFriendId} onValueChange={setSelectedFriendId}>
                <SelectTrigger
                  id="friend"
                  className="h-12 rounded-xl bg-white/10 border-indigo-500/30 text-white backdrop-blur-sm hover:bg-white/20 transition-colors"
                >
                  <SelectValue placeholder={t('sendQuestion.selectFriendPlaceholder')} />
                </SelectTrigger>
                <SelectContent className="rounded-xl">
                  {friends.length === 0 ? (
                    <div className="p-4 text-center text-sm text-muted-foreground">
                      暂无好友，请先添加好友
                    </div>
                  ) : (
                    friends.map((friendship) => {
                      const friend = friendship.friend;
                      return (
                        <SelectItem key={friend.id} value={friend.id} className="rounded-lg">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-sm font-semibold">
                              {friend.full_name.charAt(0)}
                            </div>
                            <span>{friend.full_name}</span>
                          </div>
                        </SelectItem>
                      );
                    })
                  )}
                </SelectContent>
              </Select>
            </div>

            {/* Question Text Section */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center">
                  <span className="text-white text-sm">💭</span>
                </div>
                <Label htmlFor="question" className="text-base font-semibold text-white">
                  {t('sendQuestion.question')}
                </Label>
              </div>
              <Textarea
                id="question"
                value={questionText}
                onChange={(e) => setQuestionText(e.target.value)}
                placeholder={t('sendQuestion.questionPlaceholder')}
                rows={4}
                className="rounded-xl bg-white/10 border-indigo-500/30 text-white placeholder:text-indigo-300/40 backdrop-blur-sm resize-none focus:bg-white/15 transition-colors"
              />
            </div>

            {/* Options Section */}
            <div className="space-y-3">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-pink-500 to-rose-600 flex items-center justify-center">
                    <span className="text-white text-sm">✨</span>
                  </div>
                  <Label className="text-base font-semibold text-white">
                    {t('sendQuestion.options')}
                  </Label>
                </div>
                {options.length < 5 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={handleAddOption}
                    className="h-8 gap-1 text-xs text-indigo-300 hover:text-white hover:bg-indigo-500/20"
                  >
                    <PlusIcon className="h-3 w-3" />
                    {t('sendQuestion.addOption')}
                  </Button>
                )}
              </div>
              <div className="space-y-2">
                {options.map((option, index) => (
                  <div key={index} className="flex items-center gap-2 group">
                    <div className="flex-1 relative">
                      <div className="absolute left-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-xs font-bold">
                        {index + 1}
                      </div>
                      <Input
                        value={option}
                        onChange={(e) => handleOptionChange(index, e.target.value)}
                        placeholder={`${t('sendQuestion.option')} ${index + 1}`}
                        className="pl-12 h-12 rounded-xl bg-white/10 border-indigo-500/30 text-white placeholder:text-indigo-300/40 backdrop-blur-sm focus:bg-white/15 transition-colors"
                      />
                    </div>
                    {options.length > 2 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveOption(index)}
                        className="h-12 w-12 p-0 text-rose-400 hover:text-white hover:bg-rose-500/20 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <XMarkIcon className="h-5 w-5" />
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Send Button */}
            <div className="pt-4">
              <Button
                onClick={handleSendQuestion}
                disabled={isLoading || friends.length === 0}
                className="w-full h-14 gap-3 text-base rounded-xl bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:from-indigo-500 hover:via-purple-500 hover:to-pink-500 text-white shadow-lg shadow-indigo-500/25 hover:shadow-xl hover:shadow-indigo-500/30 transition-all duration-300 hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
              >
                <PaperAirplaneIcon className="h-5 w-5" />
                {isLoading ? t('sendQuestion.sending') : t('sendQuestion.send')}
              </Button>
            </div>
          </div>
        </Card>

        {/* Helper Text */}
        <p className="text-center mt-6 text-indigo-300/60 text-sm">
          💡 提示：好友会收到通知，并可以选择其中一个选项回答
        </p>
      </div>
    </div>
  );
}
