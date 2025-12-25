'use client';

import { Button } from "./ui/button";
import Link from "next/link";
import { ArrowRightIcon, SparklesIcon } from "@heroicons/react/24/outline";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";

// Animated text component with pop effect
function AnimatedText({
  text,
  delay = 0,
  staggerDelay = 0.05,
}: {
  text: string;
  delay?: number;
  staggerDelay?: number;
}) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), delay * 1000);
    return () => clearTimeout(timer);
  }, [delay]);

  if (!isVisible) {
    return <span className="opacity-0">{text}</span>;
  }

  return (
    <>
      {text.split('').map((char, index) => (
        <span
          key={index}
          className="inline-block animate-pop-in"
          style={{
            animationDelay: `${index * staggerDelay}s`,
          }}
        >
          {char === ' ' ? '\u00A0' : char}
        </span>
      ))}
    </>
  );
}

// Animated words component
function AnimatedWords({
  text,
  delay = 0,
  staggerDelay = 0.1,
}: {
  text: string;
  delay?: number;
  staggerDelay?: number;
}) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), delay * 1000);
    return () => clearTimeout(timer);
  }, [delay]);

  if (!isVisible) {
    return <span className="opacity-0">{text}</span>;
  }

  const words = text.split(' ');

  return (
    <>
      {words.map((word, index) => (
        <span
          key={index}
          className="inline-block animate-scale-bounce mr-[0.25em]"
          style={{
            animationDelay: `${index * staggerDelay}s`,
          }}
        >
          {word}
        </span>
      ))}
    </>
  );
}

export function Hero() {
  const t = useTranslations('hero');

  return (
    <section className="relative min-h-[85vh] flex items-center justify-center overflow-hidden">
      {/* Modern gradient background */}
      <div className="absolute inset-0 -z-10">
        {/* Base gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-background via-background to-primary/5" />

        {/* Animated gradient orbs */}
        <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-gradient-to-r from-violet-500/20 to-purple-500/20 rounded-full blur-3xl animate-blob" />
        <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-gradient-to-r from-blue-500/20 to-cyan-500/20 rounded-full blur-3xl animate-blob animation-delay-2000" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-r from-pink-500/10 to-orange-500/10 rounded-full blur-3xl animate-blob animation-delay-4000" />

        {/* Grid overlay */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(0,0,0,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(0,0,0,0.02)_1px,transparent_1px)] bg-[size:64px_64px] [mask-image:radial-gradient(ellipse_at_center,black_20%,transparent_70%)]" />
      </div>

      {/* Floating decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-[10%] w-20 h-20 border border-primary/10 rounded-2xl rotate-12 animate-float" />
        <div className="absolute top-40 right-[15%] w-16 h-16 border border-primary/10 rounded-full animate-float animation-delay-2000" />
        <div className="absolute bottom-32 left-[20%] w-12 h-12 bg-gradient-to-br from-violet-500/20 to-purple-500/20 rounded-xl rotate-45 animate-float animation-delay-4000" />
        <div className="absolute bottom-40 right-[25%] w-24 h-24 border border-primary/5 rounded-3xl -rotate-12 animate-float" />
      </div>

      <div className="relative z-10 max-w-6xl mx-auto px-4 py-20 text-center">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-5 py-2.5 mb-8 rounded-full bg-gradient-to-r from-primary/10 to-violet-500/10 border border-primary/20 backdrop-blur-sm animate-fade-in-up">
          <SparklesIcon className="h-4 w-4 text-violet-500 animate-pulse" />
          <span className="text-sm font-medium">
            {t('badge')}
          </span>
        </div>

        {/* Main heading with pop animation */}
        <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight mb-6">
          <AnimatedText
            text={t('title')}
            delay={0.2}
            staggerDelay={0.08}
          />
        </h1>

        {/* Subtitle with word animation */}
        <p className="text-2xl md:text-3xl lg:text-4xl font-semibold mb-6 text-violet-600 dark:text-violet-400">
          <AnimatedWords
            text={t('subtitle')}
            delay={0.8}
            staggerDelay={0.15}
          />
        </p>

        {/* Description */}
        <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed animate-fade-in-up" style={{ animationDelay: '1.5s', opacity: 0 }}>
          {t('description')}
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16 animate-fade-in-up" style={{ animationDelay: '1.8s', opacity: 0 }}>
          <Button
            asChild
            size="lg"
            className="text-base px-8 py-6 bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 text-white shadow-lg shadow-violet-500/25 hover:shadow-xl hover:shadow-violet-500/30 transition-all duration-300 hover:scale-105 group"
          >
            <Link href="/apps">
              {t('cta.primary')}
              <ArrowRightIcon className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </Button>
          <Button
            asChild
            variant="outline"
            size="lg"
            className="text-base px-8 py-6 border-2 hover:bg-primary/5 transition-all duration-300"
          >
            <Link href="#use-cases">
              {t('cta.secondary')}
            </Link>
          </Button>
        </div>

        {/* Feature cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto animate-fade-in-up" style={{ animationDelay: '2.1s', opacity: 0 }}>
          <FeatureCard
            icon="🎲"
            title={t('features.smartDecision.title')}
            description={t('features.smartDecision.description')}
            gradient="from-violet-500/10 to-purple-500/10"
          />
          <FeatureCard
            icon="⚡"
            title={t('features.fastConvenient.title')}
            description={t('features.fastConvenient.description')}
            gradient="from-blue-500/10 to-cyan-500/10"
          />
          <FeatureCard
            icon="🎯"
            title={t('features.preciseMatching.title')}
            description={t('features.preciseMatching.description')}
            gradient="from-orange-500/10 to-pink-500/10"
          />
        </div>
      </div>

      {/* Bottom fade */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent" />
    </section>
  );
}

function FeatureCard({
  icon,
  title,
  description,
  gradient,
}: {
  icon: string;
  title: string;
  description: string;
  gradient: string;
}) {
  return (
    <div className={`group relative p-8 rounded-3xl border bg-gradient-to-br ${gradient} backdrop-blur-sm hover:scale-105 transition-all duration-300 hover:shadow-xl`}>
      {/* Glow effect on hover */}
      <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-white/50 to-white/0 dark:from-white/10 dark:to-white/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

      <div className="relative z-10">
        <div className="text-5xl mb-4 group-hover:scale-110 transition-transform duration-300">
          {icon}
        </div>
        <h3 className="text-lg font-semibold mb-2">{title}</h3>
        <p className="text-sm text-muted-foreground leading-relaxed">{description}</p>
      </div>
    </div>
  );
}
