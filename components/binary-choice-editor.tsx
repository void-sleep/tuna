'use client';

import { useTranslations } from "next-intl";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";

export interface BinaryChoiceConfig {
  optionA: {
    text: string;
    icon: string;
    description: string;
    color: string;
  };
  optionB: {
    text: string;
    icon: string;
    description: string;
    color: string;
  };
}

interface BinaryChoiceEditorProps {
  config: BinaryChoiceConfig;
  onChange: (config: BinaryChoiceConfig) => void;
}

const COLOR_OPTIONS = [
  { value: 'green', class: 'from-green-500 to-emerald-600', bg: 'bg-green-500/10', border: 'border-green-500/30' },
  { value: 'blue', class: 'from-blue-500 to-cyan-600', bg: 'bg-blue-500/10', border: 'border-blue-500/30' },
  { value: 'purple', class: 'from-purple-500 to-pink-600', bg: 'bg-purple-500/10', border: 'border-purple-500/30' },
  { value: 'red', class: 'from-red-500 to-rose-600', bg: 'bg-red-500/10', border: 'border-red-500/30' },
  { value: 'orange', class: 'from-orange-500 to-amber-600', bg: 'bg-orange-500/10', border: 'border-orange-500/30' },
  { value: 'pink', class: 'from-pink-500 to-fuchsia-600', bg: 'bg-pink-500/10', border: 'border-pink-500/30' },
];

export function BinaryChoiceEditor({ config, onChange }: BinaryChoiceEditorProps) {
  const t = useTranslations('binaryChoice.edit');
  const tColors = useTranslations('binaryChoice.edit.colors');

  const handleOptionChange = (
    option: 'optionA' | 'optionB',
    field: string,
    value: string
  ) => {
    onChange({
      ...config,
      [option]: {
        ...config[option],
        [field]: value,
      },
    });
  };

  const renderOptionEditor = (
    option: 'optionA' | 'optionB',
    optionConfig: BinaryChoiceConfig['optionA']
  ) => {
    const colorOption = COLOR_OPTIONS.find(c => c.value === optionConfig.color) || COLOR_OPTIONS[0];

    return (
      <div className="group relative rounded-2xl border bg-card overflow-hidden transition-all duration-300 hover:shadow-xl hover:shadow-violet-500/5">
        {/* Top gradient bar */}
        <div className={`h-1.5 bg-gradient-to-r ${colorOption.class}`} />

        <div className="p-6">
          {/* Header with icon preview */}
          <div className="flex items-center gap-4 mb-6">
            <div className={`w-16 h-16 rounded-xl ${colorOption.bg} border ${colorOption.border} flex items-center justify-center text-4xl transition-transform duration-300 group-hover:scale-110`}>
              {optionConfig.icon || '❓'}
            </div>
            <div>
              <h3 className="text-xl font-semibold">{t(option)}</h3>
              <p className="text-sm text-muted-foreground">Configure this option</p>
            </div>
          </div>

          <div className="space-y-5">
            {/* Text Input */}
            <div className="space-y-2">
              <Label htmlFor={`${option}-text`} className="text-sm font-medium">
                {t('form.text')}
              </Label>
              <Input
                id={`${option}-text`}
                value={optionConfig.text}
                onChange={(e) => handleOptionChange(option, 'text', e.target.value)}
                placeholder={t('form.textPlaceholder')}
                className="rounded-xl border-border/50 focus:border-brand transition-colors"
              />
            </div>

            {/* Icon Input */}
            <div className="space-y-2">
              <Label htmlFor={`${option}-icon`} className="text-sm font-medium">
                {t('form.icon')}
              </Label>
              <Input
                id={`${option}-icon`}
                value={optionConfig.icon}
                onChange={(e) => handleOptionChange(option, 'icon', e.target.value)}
                placeholder={t('form.iconPlaceholder')}
                maxLength={2}
                className="rounded-xl border-border/50 focus:border-brand transition-colors w-24 text-center text-2xl"
              />
            </div>

            {/* Description Input */}
            <div className="space-y-2">
              <Label htmlFor={`${option}-description`} className="text-sm font-medium">
                {t('form.description')}
              </Label>
              <Textarea
                id={`${option}-description`}
                value={optionConfig.description}
                onChange={(e) => handleOptionChange(option, 'description', e.target.value)}
                placeholder={t('form.descriptionPlaceholder')}
                rows={3}
                className="rounded-xl border-border/50 focus:border-brand transition-colors resize-none"
              />
            </div>

            {/* Color Select */}
            <div className="space-y-2">
              <Label htmlFor={`${option}-color`} className="text-sm font-medium">
                {t('form.color')}
              </Label>
              <Select
                value={optionConfig.color}
                onValueChange={(value) => handleOptionChange(option, 'color', value)}
              >
                <SelectTrigger id={`${option}-color`} className="rounded-xl border-border/50">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="rounded-xl">
                  {COLOR_OPTIONS.map((color) => (
                    <SelectItem key={color.value} value={color.value} className="rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className={`w-6 h-6 rounded-lg bg-gradient-to-r ${color.class}`} />
                        <span>{tColors(color.value)}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Preview Badge */}
          <div className="mt-6 pt-6 border-t border-border/50">
            <p className="text-xs text-muted-foreground mb-3">Preview</p>
            <div className={`p-4 rounded-xl bg-gradient-to-r ${colorOption.class} text-white`}>
              <div className="flex items-center gap-3">
                <span className="text-3xl">{optionConfig.icon || '❓'}</span>
                <div>
                  <p className="font-semibold">{optionConfig.text || 'Option Name'}</p>
                  <p className="text-sm opacity-90 line-clamp-1">{optionConfig.description || 'Description...'}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {renderOptionEditor('optionA', config.optionA)}
      {renderOptionEditor('optionB', config.optionB)}
    </div>
  );
}
