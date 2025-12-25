'use client';

import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";

export function Stats() {
  const t = useTranslations('stats');

  const stats = [
    { key: 'decisions', value: 10000, suffix: '+', icon: '🎯' },
    { key: 'users', value: 500, suffix: '+', icon: '👥' },
    { key: 'apps', value: 1000, suffix: '+', icon: '📱' },
    { key: 'uptime', value: 99.9, suffix: '%', icon: '⚡' },
  ];

  return (
    <section className="relative py-24 overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-r from-violet-500/5 via-purple-500/5 to-blue-500/5" />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(0,0,0,0.01)_1px,transparent_1px),linear-gradient(90deg,rgba(0,0,0,0.01)_1px,transparent_1px)] bg-[size:40px_40px]" />
      </div>

      <div className="max-w-7xl mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            {t('title')}
          </h2>
          <p className="text-lg text-muted-foreground max-w-xl mx-auto">
            {t('subtitle')}
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
          {stats.map((stat) => (
            <StatCard key={stat.key} stat={stat} label={t(`items.${stat.key}`)} />
          ))}
        </div>
      </div>
    </section>
  );
}

function StatCard({
  stat,
  label,
}: {
  stat: { key: string; value: number; suffix: string; icon: string };
  label: string;
}) {
  const [displayValue, setDisplayValue] = useState(0);
  const [hasAnimated, setHasAnimated] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !hasAnimated) {
            setHasAnimated(true);
            animateValue(0, stat.value, 2000);
          }
        });
      },
      { threshold: 0.5 }
    );

    const element = document.getElementById(`stat-${stat.key}`);
    if (element) observer.observe(element);

    return () => observer.disconnect();
  }, [stat.value, stat.key, hasAnimated]);

  const animateValue = (start: number, end: number, duration: number) => {
    const startTime = Date.now();
    const step = () => {
      const currentTime = Date.now();
      const progress = Math.min((currentTime - startTime) / duration, 1);
      const easeProgress = 1 - Math.pow(1 - progress, 3); // Ease out cubic
      setDisplayValue(Math.floor(start + (end - start) * easeProgress * 10) / 10);
      if (progress < 1) {
        requestAnimationFrame(step);
      } else {
        setDisplayValue(end);
      }
    };
    requestAnimationFrame(step);
  };

  const formatValue = (value: number) => {
    if (stat.key === 'uptime') {
      return value.toFixed(1);
    }
    if (value >= 1000) {
      return Math.floor(value / 100) / 10 + 'K';
    }
    return Math.floor(value);
  };

  return (
    <div
      id={`stat-${stat.key}`}
      className="group relative p-6 md:p-8 rounded-3xl border bg-card/50 backdrop-blur-sm hover:bg-card transition-all duration-300 hover:shadow-xl text-center"
    >
      {/* Icon */}
      <div className="text-4xl mb-4 group-hover:scale-110 transition-transform duration-300">
        {stat.icon}
      </div>

      {/* Value */}
      <div className="text-3xl md:text-4xl font-bold mb-2 bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent">
        {formatValue(displayValue)}{stat.suffix}
      </div>

      {/* Label */}
      <p className="text-sm text-muted-foreground">{label}</p>
    </div>
  );
}
