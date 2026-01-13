'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { XMarkIcon, PlusIcon } from '@heroicons/react/24/outline';
import type { FriendWithUser } from '@/lib/types/doyouagree';
import { createAgreeQuestionAction } from '@/app/actions/agree-questions';
import { toast } from 'sonner';

interface CreateQuestionDialogProps {
  friends?: FriendWithUser[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreated?: () => void;
  /** Alias for onCreated */
  onSuccess?: () => void;
  /** Pre-select a specific friend (bypasses friend list requirement) */
  preselectedFriendId?: string;
}

export function CreateQuestionDialog({
  friends,
  open,
  onOpenChange,
  onCreated,
  onSuccess,
  preselectedFriendId,
}: CreateQuestionDialogProps) {
  const t = useTranslations('questions');
  const [selectedFriendId, setSelectedFriendId] = useState<string>(preselectedFriendId || '');
  const [questionText, setQuestionText] = useState('');
  const [options, setOptions] = useState<string[]>(['', '']);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleAddOption = () => {
    if (options.length < 6) {
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

  const handleSubmit = async () => {
    if (!selectedFriendId || !questionText.trim()) {
      toast.error('请填写完整信息');
      return;
    }

    const validOptions = options.filter((opt) => opt.trim());
    if (validOptions.length < 2) {
      toast.error('至少需要2个选项');
      return;
    }

    setIsSubmitting(true);

    // Create a temporary application for this question
    const appResponse = await fetch('/api/applications', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: questionText.substring(0, 50),
        description: questionText,
        type: 'agree_question',
      }),
    });

    if (!appResponse.ok) {
      setIsSubmitting(false);
      toast.error('创建应用失败');
      return;
    }

    const application = await appResponse.json();

    const result = await createAgreeQuestionAction({
      applicationId: application.id,
      toUserId: selectedFriendId,
      questionText,
      options: validOptions,
    });

    setIsSubmitting(false);

    if (result.success) {
      toast.success('提问已发送');
      onOpenChange(false);
      resetForm();
      onCreated?.();
      onSuccess?.();
    } else {
      toast.error(result.error || '发送失败');
    }
  };

  const resetForm = () => {
    setSelectedFriendId('');
    setQuestionText('');
    setOptions(['', '']);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{t('createQuestion')}</DialogTitle>
          <DialogDescription>{t('askFriend')}</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Select Friend - only show if not preselected */}
          {!preselectedFriendId && friends && friends.length > 0 && (
            <div className="space-y-2">
              <Label>{t('selectFriend')}</Label>
              <Select value={selectedFriendId} onValueChange={setSelectedFriendId}>
                <SelectTrigger>
                  <SelectValue placeholder={t('selectFriend')} />
                </SelectTrigger>
                <SelectContent>
                  {(friends ?? []).map((friendship) => {
                    const friend = friendship.friend;
                    return (
                      <SelectItem key={friend.id} value={friend.id}>
                        {friend.full_name || friend.email || friend.id}
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Question Text */}
          <div className="space-y-2">
            <Label>{t('questionText')}</Label>
            <Input
              value={questionText}
              onChange={(e) => setQuestionText(e.target.value)}
              placeholder={t('questionPlaceholder')}
              maxLength={200}
            />
          </div>

          {/* Options */}
          <div className="space-y-2">
            <Label>{t('options')}</Label>
            <div className="space-y-2">
              {options.map((option, index) => (
                <div key={index} className="flex gap-2">
                  <Input
                    value={option}
                    onChange={(e) => handleOptionChange(index, e.target.value)}
                    placeholder={t('optionPlaceholder', { number: index + 1 })}
                    maxLength={50}
                  />
                  {options.length > 2 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => handleRemoveOption(index)}
                      className="flex-shrink-0"
                    >
                      <XMarkIcon className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
            {options.length < 6 && (
              <Button type="button" variant="outline" size="sm" onClick={handleAddOption} className="w-full gap-2">
                <PlusIcon className="h-4 w-4" />
                {t('addOption')}
              </Button>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => {
              onOpenChange(false);
              resetForm();
            }}
            disabled={isSubmitting}
          >
            取消
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? t('sending') : t('send')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
