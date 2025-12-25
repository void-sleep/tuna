'use client';

import { Button } from "./ui/button";
import Link from "next/link";
import { CheckIcon } from "@heroicons/react/24/outline";
import { useTranslations } from "next-intl";

export function PricingSection() {
  const t = useTranslations('pricing');

  const plans = [
    {
      name: t('free.name'),
      price: t('free.price'),
      period: '',
      description: t('free.description'),
      features: [
        t('free.features.apps'),
        t('free.features.basicTypes'),
        t('free.features.community'),
        t('free.features.updates'),
      ],
      cta: t('freeNow'),
      href: '/apps',
      popular: false,
      gradient: 'from-slate-500 to-slate-600',
    },
    {
      name: t('pro.name'),
      price: t('pro.price'),
      period: t('pro.period'),
      description: t('pro.description'),
      features: [
        t('pro.features.apps'),
        t('pro.features.allTypes'),
        t('pro.features.priority'),
        t('pro.features.analytics'),
        t('pro.features.export'),
        t('pro.features.support'),
      ],
      cta: t('freeNow'),
      href: '/apps',
      popular: true,
      gradient: 'from-violet-600 to-purple-600',
    },
  ];

  return (
    <section className="relative py-24 overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-b from-background via-muted/20 to-background" />
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-violet-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl" />
      </div>

      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-16">
          <span className="inline-block px-4 py-1.5 mb-6 text-sm font-medium bg-primary/10 rounded-full">
            {t('badge')}
          </span>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
            {t('title')}
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
            {t('subtitle')}
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`relative rounded-3xl border bg-card p-8 transition-all duration-300 hover:shadow-xl ${
                plan.popular
                  ? 'border-violet-500/50 shadow-lg shadow-violet-500/10'
                  : 'hover:border-border/80'
              }`}
            >
              {/* Popular badge */}
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                  <span className="inline-block px-4 py-1 text-sm font-medium text-white bg-gradient-to-r from-violet-600 to-purple-600 rounded-full shadow-lg">
                    {t('popular')}
                  </span>
                </div>
              )}

              {/* Plan header */}
              <div className="text-center mb-8">
                <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
                <p className="text-muted-foreground mb-4">{plan.description}</p>
                <div className="flex items-baseline justify-center gap-1">
                  <span className="text-5xl font-bold">{plan.price}</span>
                  {plan.period && (
                    <span className="text-muted-foreground">/{plan.period}</span>
                  )}
                </div>
              </div>

              {/* Features */}
              <ul className="space-y-4 mb-8">
                {plan.features.map((feature, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <div className={`flex-shrink-0 w-5 h-5 rounded-full bg-gradient-to-r ${plan.gradient} flex items-center justify-center mt-0.5`}>
                      <CheckIcon className="h-3 w-3 text-white" />
                    </div>
                    <span className="text-sm">{feature}</span>
                  </li>
                ))}
              </ul>

              {/* CTA Button */}
              <Button
                asChild
                className={`w-full py-6 text-base font-medium ${
                  plan.popular
                    ? 'bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 text-white shadow-lg shadow-violet-500/25'
                    : ''
                }`}
                variant={plan.popular ? 'default' : 'outline'}
              >
                <Link href={plan.href}>{plan.cta}</Link>
              </Button>
            </div>
          ))}
        </div>

        {/* FAQ or note */}
        <div className="mt-16 text-center">
          <p className="text-muted-foreground">
            {t('note')}
          </p>
        </div>
      </div>
    </section>
  );
}
