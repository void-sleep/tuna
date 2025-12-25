'use client';

import { useTranslations } from "next-intl";

export function UseCases() {
  const t = useTranslations('useCases');

  const cases = [
    {
      key: 'lunch',
      icon: '🍜',
      gradient: 'from-orange-500 to-amber-500',
      bgGradient: 'from-orange-500/10 to-amber-500/10',
      iconBg: 'bg-orange-500/20',
    },
    {
      key: 'weekend',
      icon: '🎬',
      gradient: 'from-blue-500 to-cyan-500',
      bgGradient: 'from-blue-500/10 to-cyan-500/10',
      iconBg: 'bg-blue-500/20',
    },
    {
      key: 'lottery',
      icon: '🎁',
      gradient: 'from-violet-500 to-purple-500',
      bgGradient: 'from-violet-500/10 to-purple-500/10',
      iconBg: 'bg-violet-500/20',
    },
    {
      key: 'baby',
      icon: '🍼',
      gradient: 'from-green-500 to-emerald-500',
      bgGradient: 'from-green-500/10 to-emerald-500/10',
      iconBg: 'bg-green-500/20',
    },
  ] as const;

  return (
    <section id="use-cases" className="relative py-24 overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-b from-background via-muted/20 to-background" />
        {/* Decorative gradient blobs */}
        <div className="absolute top-1/4 left-0 w-[500px] h-[500px] bg-gradient-to-r from-orange-500/5 to-amber-500/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-0 w-[500px] h-[500px] bg-gradient-to-r from-violet-500/5 to-purple-500/5 rounded-full blur-3xl" />
      </div>

      <div className="max-w-7xl mx-auto px-4">
        {/* Section Header */}
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

        {/* Use Cases Grid - Bento style */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {cases.map((useCase, index) => (
            <div
              key={useCase.key}
              className={`group relative overflow-hidden rounded-3xl border bg-card transition-all duration-500 hover:shadow-2xl ${
                index === 0 ? 'md:row-span-2' : ''
              }`}
            >
              {/* Background gradient on hover */}
              <div className={`absolute inset-0 bg-gradient-to-br ${useCase.bgGradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />

              {/* Content */}
              <div className={`relative z-10 p-8 ${index === 0 ? 'md:p-12' : ''} h-full flex flex-col`}>
                {/* Icon with background */}
                <div className={`${useCase.iconBg} w-20 h-20 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                  <span className={`text-5xl ${index === 0 ? 'md:text-6xl' : ''}`}>{useCase.icon}</span>
                </div>

                {/* Text content */}
                <div className="flex-1">
                  <h3 className={`font-bold mb-3 ${index === 0 ? 'text-2xl md:text-3xl' : 'text-xl md:text-2xl'}`}>
                    {t(`cases.${useCase.key}.title`)}
                  </h3>
                  <p className={`text-muted-foreground leading-relaxed ${index === 0 ? 'text-base md:text-lg' : ''}`}>
                    {t(`cases.${useCase.key}.description`)}
                  </p>
                </div>

                {/* Decorative gradient line */}
                <div className={`mt-6 h-1 w-16 rounded-full bg-gradient-to-r ${useCase.gradient} opacity-50 group-hover:w-24 group-hover:opacity-100 transition-all duration-300`} />
              </div>

              {/* Corner decoration */}
              <div className={`absolute -bottom-16 -right-16 w-48 h-48 bg-gradient-to-br ${useCase.bgGradient} rounded-full blur-2xl opacity-50 group-hover:opacity-100 transition-opacity duration-500`} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
