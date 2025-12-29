'use client';

import { useState, useEffect, useCallback, useMemo } from "react";
import { useTranslations } from "next-intl";
import type { BinaryChoiceConfig } from "./binary-choice-editor";

interface BinaryChoiceRunnerProps {
  config: BinaryChoiceConfig;
  applicationId: string;
  fullscreen?: boolean;
}

type RunnerPhase = 'idle' | 'preparing' | 'spinning' | 'revealing' | 'complete';

// Phase timing configuration (in milliseconds)
const PHASE_TIMING = {
  preparing: 500,
  spinning: 2500,
  revealing: 800,
};

// Violet theme colors for the runner
const VIOLET_THEME = {
  gradient: 'from-violet-600 via-purple-600 to-fuchsia-600',
  gradientLight: 'from-violet-500 via-purple-500 to-fuchsia-500',
  shadow: 'shadow-violet-500/30',
  shadowIntense: 'shadow-violet-500/50',
  glow: 'bg-violet-500/20',
  glowIntense: 'bg-violet-500/40',
  text: 'text-violet-600 dark:text-violet-400',
  border: 'border-violet-500/30',
  button: 'bg-violet-600 hover:bg-violet-500',
  rgb: '139, 92, 246',
};

export function BinaryChoiceRunner({ config, applicationId, fullscreen = false }: BinaryChoiceRunnerProps) {
  const t = useTranslations('binaryChoice.run');
  const [phase, setPhase] = useState<RunnerPhase>('idle');
  const [result, setResult] = useState<'A' | 'B' | null>(null);
  const [displayOption, setDisplayOption] = useState<'A' | 'B'>('A');
  const [spinCount, setSpinCount] = useState(0);

  // Generate particles for celebration
  const particles = useMemo(() => {
    return Array.from({ length: 20 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      delay: Math.random() * 0.5,
      duration: 2 + Math.random() * 2,
      size: 4 + Math.random() * 8,
      color: ['violet', 'purple', 'fuchsia', 'pink'][Math.floor(Math.random() * 4)],
    }));
  }, []);

  const saveResult = useCallback(async (chosen: 'A' | 'B') => {
    try {
      const selectedOption = chosen === 'A' ? config.optionA : config.optionB;
      await fetch(`/api/applications/${applicationId}/results`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          result_data: {
            selected_option: chosen,
            selected_text: selectedOption.text,
            selected_icon: selectedOption.icon,
            selected_color: selectedOption.color,
            duration_ms: PHASE_TIMING.preparing + PHASE_TIMING.spinning + PHASE_TIMING.revealing,
            timestamp: new Date().toISOString(),
          },
        }),
      });
    } catch (error) {
      console.error('Error saving result:', error);
    }
  }, [config, applicationId]);

  // Phase state machine
  useEffect(() => {
    if (phase === 'preparing') {
      const timer = setTimeout(() => setPhase('spinning'), PHASE_TIMING.preparing);
      return () => clearTimeout(timer);
    }

    if (phase === 'spinning') {
      // Fast switching animation
      const switchInterval = setInterval(() => {
        setDisplayOption(prev => prev === 'A' ? 'B' : 'A');
        setSpinCount(prev => prev + 1);
      }, 100);

      // End spinning and reveal result
      const timer = setTimeout(() => {
        clearInterval(switchInterval);
        const chosen = Math.random() > 0.5 ? 'A' : 'B';
        setResult(chosen);
        setDisplayOption(chosen);
        setPhase('revealing');
        saveResult(chosen);
      }, PHASE_TIMING.spinning);

      return () => {
        clearInterval(switchInterval);
        clearTimeout(timer);
      };
    }

    if (phase === 'revealing') {
      const timer = setTimeout(() => setPhase('complete'), PHASE_TIMING.revealing);
      return () => clearTimeout(timer);
    }
  }, [phase, saveResult]);

  const handleStart = () => {
    setResult(null);
    setSpinCount(0);
    setDisplayOption('A');
    setPhase('preparing');
  };

  const currentOption = displayOption === 'A' ? config.optionA : config.optionB;

  // Determine animation classes based on phase
  const getCardAnimationClass = () => {
    switch (phase) {
      case 'preparing':
        return 'animate-preparing scale-95';
      case 'spinning':
        return 'animate-glow-intensify';
      case 'revealing':
        return 'animate-victory-burst';
      case 'complete':
        return 'animate-neon-violet';
      default:
        return '';
    }
  };

  const getContentAnimationClass = () => {
    switch (phase) {
      case 'spinning':
        return 'animate-spin-switch';
      case 'revealing':
        return 'animate-result-reveal';
      default:
        return '';
    }
  };

  return (
    <div className={`flex flex-col items-center justify-center gap-8 ${fullscreen ? 'min-h-screen px-4' : 'min-h-[600px]'}`}>
      {/* Background effects for fullscreen mode */}
      {fullscreen && (
        <div className="fixed inset-0 -z-10 overflow-hidden">
          {/* Radial gradient background */}
          <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-violet-950/50 to-slate-900" />

          {/* Floating particles */}
          <div className="absolute inset-0">
            {particles.map((particle) => (
              <div
                key={particle.id}
                className={`absolute rounded-full opacity-30 bg-${particle.color}-500`}
                style={{
                  left: `${particle.x}%`,
                  bottom: '-20px',
                  width: particle.size,
                  height: particle.size,
                  animation: phase !== 'idle' ? `particle-float-up ${particle.duration}s ease-out ${particle.delay}s forwards` : 'none',
                }}
              />
            ))}
          </div>

          {/* Pulsing center glow */}
          {phase !== 'idle' && (
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
              <div className="w-[600px] h-[600px] rounded-full bg-violet-500/10 blur-3xl animate-pulse" />
            </div>
          )}
        </div>
      )}

      {/* Radial pulse wave on reveal */}
      {phase === 'revealing' && (
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none">
          <div className="w-20 h-20 rounded-full bg-violet-500/50 animate-radial-pulse" />
        </div>
      )}

      {/* Main Card - INCREASED SIZE */}
      <div className="relative w-full max-w-4xl">
        {/* Outer glow effect */}
        <div
          className={`
            absolute inset-0 rounded-[2.5rem] blur-3xl scale-110 transition-all duration-500
            ${phase === 'spinning' ? VIOLET_THEME.glowIntense : VIOLET_THEME.glow}
          `}
        />

        <div
          className={`
            relative w-full min-h-[400px] md:min-h-[480px] rounded-[2rem] shadow-2xl ${VIOLET_THEME.shadow}
            transition-all duration-300 transform overflow-hidden
            ${getCardAnimationClass()}
            ${phase === 'spinning' ? 'rotate-1' : ''}
            ${phase === 'complete' ? 'scale-[1.02]' : 'scale-100'}
          `}
        >
          {/* Background gradient */}
          <div
            className={`
              absolute inset-0 bg-gradient-to-br ${VIOLET_THEME.gradient}
              transition-all duration-300
            `}
          />

          {/* Decorative elements */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-80 h-80 bg-white/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.15),transparent_50%)]" />

          {/* Animated border for spinning phase */}
          {phase === 'spinning' && (
            <div className="absolute inset-0 rounded-[2rem] border-2 border-white/30 animate-pulse" />
          )}

          {/* Content */}
          <div className="relative z-10 h-full flex flex-col items-center justify-center p-8 md:p-16 text-white min-h-[400px] md:min-h-[480px]">
            {/* Idle State */}
            {phase === 'idle' && (
              <div className="text-center animate-fade-in-up">
                <div className="flex items-center justify-center gap-4 md:gap-8 mb-6 md:mb-10">
                  <div className="text-5xl md:text-7xl opacity-80 animate-float" style={{ animationDelay: '0s' }}>
                    {config.optionA.icon}
                  </div>
                  <div className="text-3xl md:text-5xl opacity-60">⚡</div>
                  <div className="text-5xl md:text-7xl opacity-80 animate-float" style={{ animationDelay: '0.5s' }}>
                    {config.optionB.icon}
                  </div>
                </div>
                <h2 className="text-3xl md:text-5xl font-bold mb-3 md:mb-4">{t('title')}</h2>
                <p className="text-lg md:text-2xl opacity-80">{t('subtitle')}</p>
              </div>
            )}

            {/* Preparing State */}
            {phase === 'preparing' && (
              <div className="text-center">
                <div className="text-7xl md:text-9xl mb-6 animate-pulse">✨</div>
                <h2 className="text-2xl md:text-4xl font-bold opacity-90">{t('preparing')}</h2>
              </div>
            )}

            {/* Spinning State */}
            {phase === 'spinning' && (
              <div
                className={`text-center ${getContentAnimationClass()}`}
                key={spinCount}
              >
                <div className="text-7xl md:text-[10rem] mb-4 md:mb-8 drop-shadow-2xl">{currentOption.icon}</div>
                <h2 className="text-4xl md:text-6xl font-bold mb-3 md:mb-4">{currentOption.text}</h2>
                <p className="text-lg md:text-2xl opacity-80 flex items-center justify-center gap-2">
                  <span className="inline-block w-2 h-2 rounded-full bg-white animate-pulse" />
                  <span className="inline-block w-2 h-2 rounded-full bg-white animate-pulse" style={{ animationDelay: '0.2s' }} />
                </p>
              </div>
            )}

            {/* Revealing State */}
            {phase === 'revealing' && (
              <div className={`text-center ${getContentAnimationClass()}`}>
                <div className="text-8xl md:text-[12rem] mb-4 md:mb-8 drop-shadow-2xl">{currentOption.icon}</div>
                <h2 className="text-5xl md:text-7xl font-bold">{currentOption.text}</h2>
              </div>
            )}

            {/* Complete State */}
            {phase === 'complete' && result && (
              <div className="text-center animate-fade-in-up">
                <div className="text-7xl md:text-[10rem] mb-4 md:mb-8 drop-shadow-2xl">{currentOption.icon}</div>
                <h2 className="text-5xl md:text-7xl font-bold mb-3 md:mb-4">{currentOption.text}</h2>
                {currentOption.description && (
                  <p className="text-lg md:text-2xl opacity-80 max-w-lg mx-auto">
                    {currentOption.description}
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Confetti particles on complete */}
      {phase === 'complete' && (
        <div className="fixed inset-0 pointer-events-none overflow-hidden">
          {Array.from({ length: 30 }).map((_, i) => (
            <div
              key={i}
              className="absolute top-0 animate-confetti"
              style={{
                left: `${Math.random() * 100}%`,
                '--fall-duration': `${2 + Math.random() * 2}s`,
                '--fall-delay': `${Math.random() * 0.5}s`,
              } as React.CSSProperties}
            >
              <div
                className={`w-3 h-3 rounded-sm ${
                  ['bg-violet-400', 'bg-purple-400', 'bg-fuchsia-400', 'bg-pink-400', 'bg-white'][
                    Math.floor(Math.random() * 5)
                  ]
                }`}
              />
            </div>
          ))}
        </div>
      )}

      {/* Action Button */}
      <div className="relative z-20">
        {(phase === 'idle' || phase === 'complete') && (
          <button
            onClick={handleStart}
            className={`
              group relative w-20 h-20 md:w-24 md:h-24 rounded-full
              text-white
              shadow-2xl shadow-violet-500/40 hover:shadow-violet-500/60
              transition-all duration-500 hover:scale-105
              flex flex-col items-center justify-center
              ${phase === 'complete' ? 'animate-pulse' : ''}
            `}
          >
            {/* Outer glow ring */}
            <div className="absolute -inset-2 rounded-full bg-gradient-to-r from-violet-400 via-purple-400 to-fuchsia-400 opacity-30 blur-xl group-hover:opacity-50 transition-opacity duration-500" />
            {/* Gradient background */}
            <div className="absolute inset-0 rounded-full bg-gradient-to-br from-white/90 via-violet-100/80 to-purple-200/70 backdrop-blur-sm" />
            {/* Border */}
            <div className="absolute inset-0 rounded-full border-2 border-white/50 group-hover:border-white/80 transition-colors duration-300" />
            {/* Content */}
            <div className="relative z-10 flex items-center justify-center text-violet-600">
              <span className="text-sm md:text-base font-bold drop-shadow-sm">{t('startButton')}</span>
            </div>
          </button>
        )}

        {(phase === 'preparing' || phase === 'spinning' || phase === 'revealing') && (
          <div className="w-20 h-20 md:w-24 md:h-24 rounded-full bg-gradient-to-br from-white/20 via-violet-200/10 to-purple-200/10 backdrop-blur-sm border-2 border-white/30 flex items-center justify-center">
            <div className="flex gap-1.5">
              {[0, 1, 2].map((i) => (
                <div
                  key={i}
                  className="w-2 h-2 md:w-3 md:h-3 rounded-full bg-white animate-bounce"
                  style={{ animationDelay: `${i * 0.1}s` }}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
