'use client';

import { useTranslations } from "next-intl";
import {
  PlusCircleIcon,
  Cog6ToothIcon,
  PlayIcon,
  ArrowRightIcon
} from "@heroicons/react/24/outline";

export function HowItWorks() {
  const t = useTranslations('howItWorks');

  const steps = [
    {
      icon: PlusCircleIcon,
      number: "01",
      key: "create",
      gradient: "from-violet-500 to-purple-500",
      bgGradient: "from-violet-500/10 to-purple-500/10",
    },
    {
      icon: Cog6ToothIcon,
      number: "02",
      key: "configure",
      gradient: "from-blue-500 to-cyan-500",
      bgGradient: "from-blue-500/10 to-cyan-500/10",
    },
    {
      icon: PlayIcon,
      number: "03",
      key: "run",
      gradient: "from-orange-500 to-pink-500",
      bgGradient: "from-orange-500/10 to-pink-500/10",
    },
  ];

  return (
    <section className="relative py-24 overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-b from-background via-muted/30 to-background" />
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-violet-500/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl" />
      </div>

      <div className="max-w-7xl mx-auto px-4">
        {/* Section header */}
        <div className="text-center mb-20">
          <span className="inline-block px-4 py-1.5 mb-6 text-sm font-medium bg-primary/10 rounded-full">
            {t('badge')}
          </span>
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            {t('title')}
          </h2>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
            {t('subtitle')}
          </p>
        </div>

        {/* Steps */}
        <div className="relative">
          {/* Connection line */}
          <div className="hidden lg:block absolute top-1/2 left-0 right-0 h-0.5 bg-gradient-to-r from-violet-500/20 via-blue-500/20 to-orange-500/20 -translate-y-1/2" />

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12">
            {steps.map((step, index) => (
              <div key={step.key} className="relative group">
                {/* Arrow between steps (mobile) */}
                {index < steps.length - 1 && (
                  <div className="lg:hidden flex justify-center my-4">
                    <ArrowRightIcon className="h-6 w-6 text-muted-foreground/50 rotate-90" />
                  </div>
                )}

                <div className={`relative p-8 rounded-3xl bg-gradient-to-br ${step.bgGradient} border backdrop-blur-sm hover:scale-105 transition-all duration-300`}>
                  {/* Step number */}
                  <div className={`absolute -top-4 -left-4 w-12 h-12 rounded-2xl bg-gradient-to-br ${step.gradient} flex items-center justify-center text-white font-bold shadow-lg`}>
                    {step.number}
                  </div>

                  {/* Icon */}
                  <div className="mb-6 pt-4">
                    <div className={`inline-flex p-4 rounded-2xl bg-gradient-to-br ${step.gradient} bg-opacity-10`}>
                      <step.icon className={`h-8 w-8 bg-gradient-to-br ${step.gradient} bg-clip-text text-transparent`} style={{ stroke: `url(#gradient-${step.key})` }} />
                      <svg width="0" height="0">
                        <defs>
                          <linearGradient id={`gradient-${step.key}`} x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stopColor={step.gradient.includes('violet') ? '#8b5cf6' : step.gradient.includes('blue') ? '#3b82f6' : '#f97316'} />
                            <stop offset="100%" stopColor={step.gradient.includes('purple') ? '#a855f7' : step.gradient.includes('cyan') ? '#06b6d4' : '#ec4899'} />
                          </linearGradient>
                        </defs>
                      </svg>
                    </div>
                  </div>

                  {/* Content */}
                  <h3 className="text-xl font-semibold mb-3">
                    {t(`steps.${step.key}.title`)}
                  </h3>
                  <p className="text-muted-foreground leading-relaxed">
                    {t(`steps.${step.key}.description`)}
                  </p>
                </div>

                {/* Arrow between steps (desktop) */}
                {index < steps.length - 1 && (
                  <div className="hidden lg:flex absolute top-1/2 -right-6 z-10 -translate-y-1/2">
                    <div className="w-12 h-12 rounded-full bg-background border flex items-center justify-center shadow-lg">
                      <ArrowRightIcon className="h-5 w-5 text-muted-foreground" />
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
