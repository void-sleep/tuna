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
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import type { AgreeQuestionWithUsers } from '@/lib/types/doyouagree';
import { answerQuestionAction } from '@/app/actions/agree-questions';
import { toast } from 'sonner';

interface AnswerDialogProps {
  question: AgreeQuestionWithUsers | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAnswered?: () => void;
}

export function AnswerDialog({ question, open, onOpenChange, onAnswered }: AnswerDialogProps) {
  const t = useTranslations('questions');
  const [selectedAnswer, setSelectedAnswer] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!question || !selectedAnswer) return;

    setIsSubmitting(true);
    const result = await answerQuestionAction({
      questionId: question.id,
      answer: selectedAnswer,
    });
    setIsSubmitting(false);

    if (result.success) {
      toast.success('回答已提交');
      onOpenChange(false);
      setSelectedAnswer('');
      onAnswered?.();
    } else {
      toast.error(result.error || '提交失败');
    }
  };

  if (!question) return null;

  const options = Array.isArray(question.options) ? question.options : [];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{t('answer')}</DialogTitle>
          <DialogDescription>
            {t('from')}: {question.from_user.full_name || question.from_user.email}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Question */}
          <div className="p-4 bg-slate-50 dark:bg-slate-900 rounded-lg">
            <p className="text-sm text-slate-700 dark:text-slate-300">{question.question_text}</p>
          </div>

          {/* Options */}
          <RadioGroup value={selectedAnswer} onValueChange={setSelectedAnswer}>
            <div className="space-y-2">
              {options.map((option, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <RadioGroupItem value={option} id={`option-${index}`} />
                  <Label htmlFor={`option-${index}`} className="cursor-pointer flex-1">
                    {option}
                  </Label>
                </div>
              ))}
            </div>
          </RadioGroup>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
            取消
          </Button>
          <Button onClick={handleSubmit} disabled={!selectedAnswer || isSubmitting}>
            {isSubmitting ? t('answering') : t('answer')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
