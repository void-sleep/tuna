'use client';

import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useTranslations } from 'next-intl';

export interface AgreeQuestionConfig {
  defaultQuestion?: string;
  defaultOptions: string[];
}

export const DEFAULT_AGREE_QUESTION_CONFIG: AgreeQuestionConfig = {
  defaultQuestion: '',
  defaultOptions: ['同意', '不同意'],
};

interface AgreeQuestionEditorProps {
  config: AgreeQuestionConfig;
  onChange: (config: AgreeQuestionConfig) => void;
}

export function AgreeQuestionEditor({ config, onChange }: AgreeQuestionEditorProps) {
  const t = useTranslations('agreeQuestion.edit');

  const handleDefaultQuestionChange = (value: string) => {
    onChange({ ...config, defaultQuestion: value });
  };

  const handleOptionChange = (index: number, value: string) => {
    const newOptions = [...config.defaultOptions];
    newOptions[index] = value;
    onChange({ ...config, defaultOptions: newOptions });
  };

  return (
    <div className="space-y-8">
      {/* Info Card */}
      <Card className="p-6 bg-gradient-to-br from-indigo-50/50 to-purple-50/50 dark:from-indigo-950/20 dark:to-purple-950/20 border-2 border-indigo-200 dark:border-indigo-900">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center flex-shrink-0">
            <span className="text-2xl">💭</span>
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
              {t('infoTitle')}
            </h3>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              {t('infoDescription')}
            </p>
          </div>
        </div>
      </Card>

      {/* Default Question Template */}
      <Card className="p-6">
        <div className="space-y-4">
          <div>
            <Label htmlFor="defaultQuestion" className="text-base font-semibold">
              {t('defaultQuestion.label')}
            </Label>
            <p className="text-sm text-muted-foreground mt-1 mb-3">
              {t('defaultQuestion.description')}
            </p>
            <Textarea
              id="defaultQuestion"
              value={config.defaultQuestion}
              onChange={(e) => handleDefaultQuestionChange(e.target.value)}
              placeholder={t('defaultQuestion.placeholder')}
              rows={3}
              className="resize-none"
            />
          </div>

          <div>
            <Label className="text-base font-semibold">
              {t('defaultOptions.label')}
            </Label>
            <p className="text-sm text-muted-foreground mt-1 mb-3">
              {t('defaultOptions.description')}
            </p>
            <div className="space-y-3">
              {config.defaultOptions.map((option, index) => (
                <div key={index} className="flex items-center gap-3">
                  <span className="text-sm font-medium text-muted-foreground w-16">
                    {t('defaultOptions.option')} {index + 1}:
                  </span>
                  <Input
                    value={option}
                    onChange={(e) => handleOptionChange(index, e.target.value)}
                    placeholder={`${t('defaultOptions.option')} ${index + 1}`}
                    className="flex-1"
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </Card>

      {/* Usage Guide */}
      <Card className="p-6 bg-slate-50 dark:bg-slate-900/50">
        <h3 className="text-base font-semibold mb-3">{t('guide.title')}</h3>
        <ul className="space-y-2 text-sm text-slate-600 dark:text-slate-400">
          <li className="flex items-start gap-2">
            <span className="text-indigo-600 dark:text-indigo-400 mt-0.5">•</span>
            <span>{t('guide.step1')}</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-indigo-600 dark:text-indigo-400 mt-0.5">•</span>
            <span>{t('guide.step2')}</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-indigo-600 dark:text-indigo-400 mt-0.5">•</span>
            <span>{t('guide.step3')}</span>
          </li>
        </ul>
      </Card>
    </div>
  );
}
