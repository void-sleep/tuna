'use client';

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Slider } from "./ui/slider";

export type DifficultyLevel = 1 | 2 | 3;

export interface MathFlashConfig {
  minNumber: number;
  maxNumber: number;
  operations: {
    addition: boolean;
    subtraction: boolean;
    multiplication: boolean;
    division: boolean;
  };
  questionCount: number;
  timePerQuestion: number;
  answerDisplayTime: number;
  difficulty: DifficultyLevel;
}

interface MathFlashEditorProps {
  config: MathFlashConfig;
  onChange: (config: MathFlashConfig) => void;
}

export const DEFAULT_MATH_FLASH_CONFIG: MathFlashConfig = {
  minNumber: 1,
  maxNumber: 10,
  operations: {
    addition: true,
    subtraction: true,
    multiplication: false,
    division: false,
  },
  questionCount: 10,
  timePerQuestion: 10,
  answerDisplayTime: 3,
  difficulty: 1,
};

const DIFFICULTY_CONFIG = [
  { level: 1 as DifficultyLevel, icon: '⭐', color: 'from-green-500 to-emerald-500', bg: 'bg-green-500/10', border: 'border-green-500/30' },
  { level: 2 as DifficultyLevel, icon: '⭐⭐', color: 'from-amber-500 to-orange-500', bg: 'bg-amber-500/10', border: 'border-amber-500/30' },
  { level: 3 as DifficultyLevel, icon: '⭐⭐⭐', color: 'from-red-500 to-rose-500', bg: 'bg-red-500/10', border: 'border-red-500/30' },
] as const;

const OPERATION_CONFIG = [
  { key: 'addition', icon: '+', color: 'from-green-500 to-emerald-500', bg: 'bg-green-500/10', border: 'border-green-500/30' },
  { key: 'subtraction', icon: '−', color: 'from-blue-500 to-cyan-500', bg: 'bg-blue-500/10', border: 'border-blue-500/30' },
  { key: 'multiplication', icon: '×', color: 'from-purple-500 to-pink-500', bg: 'bg-purple-500/10', border: 'border-purple-500/30' },
  { key: 'division', icon: '÷', color: 'from-orange-500 to-amber-500', bg: 'bg-orange-500/10', border: 'border-orange-500/30' },
] as const;

export function MathFlashEditor({ config, onChange }: MathFlashEditorProps) {
  const t = useTranslations('mathFlash.edit');

  // Local state for free input without validation
  const [minInput, setMinInput] = useState(String(config.minNumber));
  const [maxInput, setMaxInput] = useState(String(config.maxNumber));

  // Sync local state when config changes externally
  useEffect(() => {
    setMinInput(String(config.minNumber));
    setMaxInput(String(config.maxNumber));
  }, [config.minNumber, config.maxNumber]);

  // Parse and update on blur (no auto-correction)
  const handleMinBlur = () => {
    const value = parseInt(minInput);
    if (!isNaN(value)) {
      onChange({ ...config, minNumber: value });
    }
  };

  const handleMaxBlur = () => {
    const value = parseInt(maxInput);
    if (!isNaN(value)) {
      onChange({ ...config, maxNumber: value });
    }
  };

  const handleOperationToggle = (operation: keyof MathFlashConfig['operations']) => {
    const newOperations = {
      ...config.operations,
      [operation]: !config.operations[operation],
    };

    // Ensure at least one operation is selected
    const hasAtLeastOne = Object.values(newOperations).some(v => v);
    if (!hasAtLeastOne) return;

    onChange({
      ...config,
      operations: newOperations,
    });
  };

  return (
    <div className="space-y-8">
      {/* Number Range Section */}
      <div className="rounded-2xl border bg-card p-6 transition-all duration-300 hover:shadow-lg hover:shadow-sky-500/5">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-14 h-14 rounded-xl bg-sky-500/10 border border-sky-500/30 flex items-center justify-center text-3xl">
            🔢
          </div>
          <div>
            <h3 className="text-xl font-semibold">{t('numberRange.title')}</h3>
            <p className="text-sm text-muted-foreground">{t('numberRange.description')}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="minNumber" className="text-sm font-medium">
              {t('numberRange.min')}
            </Label>
            <Input
              id="minNumber"
              type="number"
              value={minInput}
              onChange={(e) => setMinInput(e.target.value)}
              onBlur={handleMinBlur}
              className="rounded-xl border-border/50 focus:border-sky-500 transition-colors text-center text-xl font-bold"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="maxNumber" className="text-sm font-medium">
              {t('numberRange.max')}
            </Label>
            <Input
              id="maxNumber"
              type="number"
              value={maxInput}
              onChange={(e) => setMaxInput(e.target.value)}
              onBlur={handleMaxBlur}
              className="rounded-xl border-border/50 focus:border-sky-500 transition-colors text-center text-xl font-bold"
            />
          </div>
        </div>

        {/* Range preview */}
        <div className="mt-4 p-3 rounded-xl bg-sky-500/5 border border-sky-500/20 text-center">
          <span className="text-sm text-muted-foreground">{t('numberRange.preview')}: </span>
          <span className="font-mono font-bold text-sky-600 dark:text-sky-400">
            {config.minNumber} ~ {config.maxNumber}
          </span>
        </div>
      </div>

      {/* Operations Section */}
      <div className="rounded-2xl border bg-card p-6 transition-all duration-300 hover:shadow-lg hover:shadow-sky-500/5">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-14 h-14 rounded-xl bg-sky-500/10 border border-sky-500/30 flex items-center justify-center text-3xl">
            ➕
          </div>
          <div>
            <h3 className="text-xl font-semibold">{t('operations.title')}</h3>
            <p className="text-sm text-muted-foreground">{t('operations.description')}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {OPERATION_CONFIG.map((op) => {
            const isActive = config.operations[op.key as keyof MathFlashConfig['operations']];
            return (
              <div
                key={op.key}
                onClick={() => handleOperationToggle(op.key as keyof MathFlashConfig['operations'])}
                className={`
                  relative p-4 rounded-xl border-2 transition-all duration-200 flex flex-col items-center gap-2 cursor-pointer
                  ${isActive
                    ? `${op.bg} ${op.border} shadow-md scale-[1.02]`
                    : 'border-border/50 opacity-50 hover:opacity-75'
                  }
                `}
              >
                <div className={`w-12 h-12 rounded-lg flex items-center justify-center text-2xl font-bold ${isActive ? `bg-gradient-to-r ${op.color} text-white` : 'bg-muted text-muted-foreground'}`}>
                  {op.icon}
                </div>
                <span className="text-sm font-medium">{t(`operations.${op.key}`)}</span>
                <div
                  className={`
                    mt-1 w-8 h-[1.15rem] rounded-full transition-colors
                    ${isActive ? 'bg-primary' : 'bg-input'}
                    flex items-center ${isActive ? 'justify-end' : 'justify-start'} px-0.5
                  `}
                >
                  <div className="w-3.5 h-3.5 rounded-full bg-white shadow-sm" />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Difficulty Section */}
      <div className="rounded-2xl border bg-card p-6 transition-all duration-300 hover:shadow-lg hover:shadow-sky-500/5">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-14 h-14 rounded-xl bg-sky-500/10 border border-sky-500/30 flex items-center justify-center text-3xl">
            🎯
          </div>
          <div>
            <h3 className="text-xl font-semibold">{t('difficulty.title')}</h3>
            <p className="text-sm text-muted-foreground">{t('difficulty.description')}</p>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4">
          {DIFFICULTY_CONFIG.map((diff) => {
            const isActive = config.difficulty === diff.level;
            return (
              <div
                key={diff.level}
                onClick={() => onChange({ ...config, difficulty: diff.level })}
                className={`
                  relative p-4 rounded-xl border-2 transition-all duration-200 flex flex-col items-center gap-2 cursor-pointer
                  ${isActive
                    ? `${diff.bg} ${diff.border} shadow-md scale-[1.02]`
                    : 'border-border/50 opacity-50 hover:opacity-75'
                  }
                `}
              >
                <div className="text-2xl">{diff.icon}</div>
                <span className="text-sm font-medium">{t(`difficulty.level${diff.level}`)}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Practice Settings Section */}
      <div className="rounded-2xl border bg-card p-6 transition-all duration-300 hover:shadow-lg hover:shadow-sky-500/5">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-14 h-14 rounded-xl bg-sky-500/10 border border-sky-500/30 flex items-center justify-center text-3xl">
            ⚙️
          </div>
          <div>
            <h3 className="text-xl font-semibold">{t('settings.title')}</h3>
            <p className="text-sm text-muted-foreground">{t('settings.description')}</p>
          </div>
        </div>

        <div className="space-y-8">
          {/* Question Count */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-medium">{t('settings.questionCount')}</Label>
              <span className="text-2xl font-bold text-sky-600 dark:text-sky-400">{config.questionCount}</span>
            </div>
            <Slider
              value={[config.questionCount]}
              onValueChange={([value]) => onChange({ ...config, questionCount: value })}
              min={1}
              max={1000}
              step={1}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>1</span>
              <span>1000</span>
            </div>
          </div>

          {/* Time per Question */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-medium">{t('settings.timePerQuestion')}</Label>
              <span className="text-2xl font-bold text-sky-600 dark:text-sky-400">{config.timePerQuestion}s</span>
            </div>
            <Slider
              value={[config.timePerQuestion]}
              onValueChange={([value]) => onChange({ ...config, timePerQuestion: value })}
              min={3}
              max={120}
              step={1}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>3s</span>
              <span>120s</span>
            </div>
          </div>

          {/* Answer Display Time */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-medium">{t('settings.answerDisplayTime')}</Label>
              <span className="text-2xl font-bold text-sky-600 dark:text-sky-400">{config.answerDisplayTime}s</span>
            </div>
            <Slider
              value={[config.answerDisplayTime]}
              onValueChange={([value]) => onChange({ ...config, answerDisplayTime: value })}
              min={1}
              max={60}
              step={1}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>1s</span>
              <span>60s</span>
            </div>
          </div>
        </div>
      </div>

      {/* Preview Section */}
      <div className="rounded-2xl border bg-card p-6 transition-all duration-300 hover:shadow-lg hover:shadow-sky-500/5">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-14 h-14 rounded-xl bg-sky-500/10 border border-sky-500/30 flex items-center justify-center text-3xl">
            👀
          </div>
          <div>
            <h3 className="text-xl font-semibold">{t('preview.title')}</h3>
            <p className="text-sm text-muted-foreground">{t('preview.description')}</p>
          </div>
        </div>

        <div className="p-6 rounded-xl bg-gradient-to-br from-sky-500/10 to-blue-500/10 border border-sky-500/20">
          <div className="text-center space-y-4">
            <div className="text-5xl font-bold text-sky-600 dark:text-sky-400">
              {Math.floor(Math.random() * (config.maxNumber - config.minNumber + 1)) + config.minNumber}
              {' '}
              {OPERATION_CONFIG.find(op => config.operations[op.key as keyof MathFlashConfig['operations']])?.icon || '+'}
              {' '}
              {Math.floor(Math.random() * (config.maxNumber - config.minNumber + 1)) + config.minNumber}
              {' = ?'}
            </div>
            <div className="text-sm text-muted-foreground">
              {t('preview.sampleQuestion')}
            </div>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-3 gap-4 text-center">
          <div className="p-3 rounded-xl bg-muted/50">
            <div className="text-2xl font-bold text-foreground">{config.questionCount}</div>
            <div className="text-xs text-muted-foreground">{t('preview.questions')}</div>
          </div>
          <div className="p-3 rounded-xl bg-muted/50">
            <div className="text-2xl font-bold text-foreground">{config.timePerQuestion}s</div>
            <div className="text-xs text-muted-foreground">{t('preview.perQuestion')}</div>
          </div>
          <div className="p-3 rounded-xl bg-muted/50">
            <div className="text-2xl font-bold text-foreground">
              {Math.round((config.questionCount * config.timePerQuestion) / 60)}m
            </div>
            <div className="text-xs text-muted-foreground">{t('preview.totalTime')}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
