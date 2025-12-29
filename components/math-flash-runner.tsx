'use client';

import { useState, useEffect, useCallback } from "react";
import { useTranslations } from "next-intl";
import { Button } from "./ui/button";
import type { MathFlashConfig } from "./math-flash-editor";

type OperationType = 'addition' | 'subtraction' | 'multiplication' | 'division';
type RunnerPhase = 'idle' | 'running' | 'showAnswer' | 'complete';

interface Question {
  num1: number;
  num2: number;
  operation: OperationType;
  answer: number;
  timeTaken: number | null;
}

interface MathFlashRunnerProps {
  config: MathFlashConfig;
  applicationId: string;
  fullscreen?: boolean;
}

const OPERATION_SYMBOLS: Record<OperationType, string> = {
  addition: '+',
  subtraction: '−',
  multiplication: '×',
  division: '÷',
};

const OPERATION_COLORS: Record<OperationType, { gradient: string; shadow: string; bg: string }> = {
  addition: { gradient: 'from-green-500 to-emerald-500', shadow: 'shadow-green-500/30', bg: 'bg-green-500' },
  subtraction: { gradient: 'from-blue-500 to-cyan-500', shadow: 'shadow-blue-500/30', bg: 'bg-blue-500' },
  multiplication: { gradient: 'from-purple-500 to-pink-500', shadow: 'shadow-purple-500/30', bg: 'bg-purple-500' },
  division: { gradient: 'from-orange-500 to-amber-500', shadow: 'shadow-orange-500/30', bg: 'bg-orange-500' },
};

export function MathFlashRunner({ config, applicationId, fullscreen = false }: MathFlashRunnerProps) {
  const t = useTranslations('mathFlash.run');

  const [phase, setPhase] = useState<RunnerPhase>('idle');
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState(config.timePerQuestion);
  const [startTime, setStartTime] = useState<number | null>(null);

  // Generate a random question based on difficulty
  const generateQuestion = useCallback((): Question => {
    const enabledOps = (Object.entries(config.operations) as [OperationType, boolean][])
      .filter(([, enabled]) => enabled)
      .map(([op]) => op);

    const operation = enabledOps[Math.floor(Math.random() * enabledOps.length)];

    // Difficulty affects the effective range
    // Easy: 30% of range, Medium: 60% of range, Hard: 100% of range
    const difficulty = config.difficulty || 1;
    const rangeMultiplier = difficulty === 1 ? 0.3 : difficulty === 2 ? 0.6 : 1;
    const range = config.maxNumber - config.minNumber;
    const effectiveMax = Math.floor(config.minNumber + range * rangeMultiplier);
    const effectiveRange = effectiveMax - config.minNumber + 1;

    let num1: number, num2: number, answer: number;

    switch (operation) {
      case 'addition':
        num1 = Math.floor(Math.random() * effectiveRange) + config.minNumber;
        num2 = Math.floor(Math.random() * effectiveRange) + config.minNumber;
        answer = num1 + num2;
        break;
      case 'subtraction':
        num1 = Math.floor(Math.random() * effectiveRange) + config.minNumber;
        num2 = Math.floor(Math.random() * num1) + config.minNumber;
        if (num2 > num1) [num1, num2] = [num2, num1];
        answer = num1 - num2;
        break;
      case 'multiplication':
        num1 = Math.floor(Math.random() * effectiveRange) + config.minNumber;
        num2 = Math.floor(Math.random() * (Math.min(effectiveMax, 12) - config.minNumber + 1)) + config.minNumber;
        answer = num1 * num2;
        break;
      case 'division':
        num2 = Math.floor(Math.random() * (Math.min(effectiveMax, 12) - config.minNumber + 1)) + config.minNumber;
        if (num2 === 0) num2 = 1;
        answer = Math.floor(Math.random() * effectiveRange) + config.minNumber;
        num1 = num2 * answer;
        break;
      default:
        num1 = 1;
        num2 = 1;
        answer = 2;
    }

    return {
      num1,
      num2,
      operation,
      answer,
      timeTaken: null,
    };
  }, [config]);

  // Save results to backend
  const saveResults = useCallback(async (finalQuestions: Question[]) => {
    const totalTime = finalQuestions.reduce((sum, q) => sum + (q.timeTaken || config.timePerQuestion), 0);

    try {
      await fetch(`/api/applications/${applicationId}/results`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          result_data: {
            questions: finalQuestions,
            totalQuestions: finalQuestions.length,
            totalTime,
          },
        }),
      });
    } catch (error) {
      console.error('Error saving results:', error);
    }
  }, [applicationId, config.timePerQuestion]);

  // Generate all questions at start
  const startPractice = useCallback(() => {
    const newQuestions = Array.from({ length: config.questionCount }, () => generateQuestion());
    setQuestions(newQuestions);
    setCurrentIndex(0);
    setPhase('running');
    setTimeLeft(config.timePerQuestion);
    setStartTime(Date.now());
  }, [config.questionCount, config.timePerQuestion, generateQuestion]);

  // Show answer when time expires
  const showAnswer = useCallback(() => {
    if (phase !== 'running') return;

    const timeTaken = startTime ? (Date.now() - startTime) / 1000 : config.timePerQuestion;

    const updatedQuestions = [...questions];
    updatedQuestions[currentIndex] = {
      ...questions[currentIndex],
      timeTaken,
    };
    setQuestions(updatedQuestions);

    setPhase('showAnswer');

    // Auto advance after showing answer
    setTimeout(() => {
      if (currentIndex < config.questionCount - 1) {
        setCurrentIndex(currentIndex + 1);
        setTimeLeft(config.timePerQuestion);
        setStartTime(Date.now());
        setPhase('running');
      } else {
        setPhase('complete');
        saveResults(updatedQuestions);
      }
    }, (config.answerDisplayTime || 3) * 1000);
  }, [phase, questions, currentIndex, startTime, config.questionCount, config.timePerQuestion, config.answerDisplayTime, saveResults]);

  // Timer countdown
  useEffect(() => {
    if (phase !== 'running') return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          showAnswer();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [phase, showAnswer]);

  const currentQuestion = questions[currentIndex];
  const opColor = currentQuestion ? OPERATION_COLORS[currentQuestion.operation] : OPERATION_COLORS.addition;

  // Idle state - Start screen
  if (phase === 'idle') {
    return (
      <div className={`flex flex-col items-center justify-center ${fullscreen ? 'h-full' : 'min-h-[400px]'} p-8`}>
        <div className="text-center space-y-8">
          <div className="relative">
            <div className="absolute inset-0 bg-orange-500/20 rounded-full blur-3xl animate-pulse" />
            <div className="relative w-32 h-32 mx-auto rounded-full bg-gradient-to-br from-orange-500/20 to-amber-500/20 border-2 border-orange-500/30 flex items-center justify-center">
              <span className="text-6xl animate-bounce">🧮</span>
            </div>
          </div>

          <div>
            <h2 className="text-3xl font-bold text-white mb-2">{t('ready.title')}</h2>
            <p className="text-orange-300/70 max-w-md">
              {t('ready.description', { count: config.questionCount, time: config.timePerQuestion })}
            </p>
          </div>

          <Button
            onClick={startPractice}
            className="px-6 py-2 text-sm font-bold bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-400 hover:to-amber-400 text-white rounded-lg shadow-lg shadow-orange-500/30 transition-all hover:scale-105"
          >
            {t('ready.startButton')}
          </Button>
        </div>
      </div>
    );
  }

  // Running or ShowAnswer state
  if (phase === 'running' || phase === 'showAnswer') {
    return (
      <div className={`flex flex-col items-center justify-center ${fullscreen ? 'h-full' : 'min-h-[400px]'} p-4 md:p-8`}>
        {/* Progress bar */}
        <div className="absolute top-20 left-4 right-4 md:left-8 md:right-8">
          <div className="flex items-center gap-4 mb-2">
            <span className="text-orange-300/80 text-sm font-medium whitespace-nowrap">
              {currentIndex + 1} / {config.questionCount}
            </span>
            <div className="flex-1 h-2 bg-orange-500/20 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-orange-500 to-amber-500 rounded-full transition-all duration-300"
                style={{ width: `${((currentIndex + 1) / config.questionCount) * 100}%` }}
              />
            </div>
          </div>
        </div>

        {/* Timer - Large circular display */}
        <div className="absolute top-28 left-1/2 -translate-x-1/2">
          <div className="relative w-20 h-20 md:w-24 md:h-24">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 64 64">
              <circle
                cx="32"
                cy="32"
                r="28"
                fill="none"
                stroke="currentColor"
                strokeWidth="4"
                className="text-orange-500/20"
              />
              <circle
                cx="32"
                cy="32"
                r="28"
                fill="none"
                stroke="currentColor"
                strokeWidth="4"
                strokeDasharray={2 * Math.PI * 28}
                strokeDashoffset={2 * Math.PI * 28 * (1 - timeLeft / config.timePerQuestion)}
                className={`transition-all duration-1000 ${timeLeft <= 3 ? 'text-red-500' : 'text-orange-400'}`}
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className={`text-2xl md:text-3xl font-bold ${timeLeft <= 3 ? 'text-red-400 animate-pulse' : 'text-orange-300'}`}>
                {timeLeft}
              </span>
            </div>
          </div>
        </div>

        {/* Question display - Prominent, fixed layout */}
        <div className="flex items-center justify-center mt-16">
          {currentQuestion && (
            <div className="flex items-center justify-center gap-2 md:gap-4 whitespace-nowrap">
              {/* First number */}
              <span className="text-7xl md:text-9xl font-bold text-white tabular-nums min-w-[80px] md:min-w-[120px] text-right">
                {currentQuestion.num1}
              </span>

              {/* Operation symbol */}
              <span className={`
                w-14 h-14 md:w-20 md:h-20
                rounded-xl md:rounded-2xl
                bg-gradient-to-r ${opColor.gradient}
                ${opColor.shadow} shadow-lg
                flex items-center justify-center
                text-4xl md:text-6xl font-bold text-white
                flex-shrink-0
              `}>
                {OPERATION_SYMBOLS[currentQuestion.operation]}
              </span>

              {/* Second number */}
              <span className="text-7xl md:text-9xl font-bold text-white tabular-nums min-w-[80px] md:min-w-[120px] text-left">
                {currentQuestion.num2}
              </span>

              {/* Equals sign */}
              <span className="text-7xl md:text-9xl font-bold text-orange-400 flex-shrink-0">
                =
              </span>

              {/* Answer area - fixed width, shows ? or answer */}
              <span className="text-7xl md:text-9xl font-bold tabular-nums min-w-[120px] md:min-w-[180px] text-center">
                {phase === 'showAnswer' ? (
                  <span className="text-green-400 animate-scale-in inline-block">
                    {currentQuestion.answer}
                  </span>
                ) : (
                  <span className="text-orange-400/50">?</span>
                )}
              </span>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Complete state
  const totalTime = Math.round(questions.reduce((sum, q) => sum + (q.timeTaken || config.timePerQuestion), 0));

  return (
    <div className={`flex flex-col items-center justify-center ${fullscreen ? 'h-full' : 'min-h-[400px]'} p-8`}>
      <div className="text-center space-y-8 max-w-lg">
        {/* Celebration */}
        <div className="relative">
          <div className="absolute inset-0 bg-orange-500/20 rounded-full blur-3xl animate-pulse" />
          <div className="relative w-32 h-32 mx-auto rounded-full bg-gradient-to-br from-orange-500/20 to-amber-500/20 border-2 border-orange-500/30 flex items-center justify-center">
            <span className="text-6xl">🎉</span>
          </div>
        </div>

        <div>
          <h2 className="text-3xl font-bold text-white mb-2">{t('complete.title')}</h2>
          <p className="text-orange-300/70">{t('complete.description')}</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-4">
          <div className="p-4 rounded-2xl bg-slate-800/50 border border-orange-500/20">
            <div className="text-4xl font-bold text-orange-400">
              {config.questionCount}
            </div>
            <div className="text-sm text-orange-300/60">{t('complete.questions')}</div>
          </div>
          <div className="p-4 rounded-2xl bg-slate-800/50 border border-orange-500/20">
            <div className="text-4xl font-bold text-orange-400">
              {totalTime}s
            </div>
            <div className="text-sm text-orange-300/60">{t('complete.totalTime')}</div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-4 justify-center">
          <Button
            onClick={startPractice}
            size="lg"
            className="px-8 py-4 text-lg font-bold bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-400 hover:to-amber-400 text-white rounded-xl shadow-lg shadow-orange-500/30"
          >
            {t('complete.tryAgain')}
          </Button>
        </div>
      </div>
    </div>
  );
}
