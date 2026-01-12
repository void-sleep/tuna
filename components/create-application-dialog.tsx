'use client';

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { Button } from "./ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import { PlusIcon, RocketLaunchIcon, CheckIcon } from "@heroicons/react/24/outline";
import type { ApplicationType } from "@/lib/supabase/applications";

interface CreateApplicationDialogProps {
  children: React.ReactNode;
}

// App type configurations with theme colors (only available types)
const APP_TYPES = [
  {
    value: 'coin' as ApplicationType,
    icon: '🎲',
    labelKey: 'coin',
    bgLight: 'bg-violet-50',
    bgDark: 'dark:bg-violet-950/30',
    borderLight: 'border-violet-200',
    borderDark: 'dark:border-violet-800/50',
    gradient: 'from-violet-500 via-purple-500 to-fuchsia-500',
    selectedBorder: 'border-violet-500',
    shadow: 'shadow-violet-500/20',
    textColor: 'text-violet-600 dark:text-violet-400',
  },
  {
    value: 'math_flash' as ApplicationType,
    icon: '🧮',
    labelKey: 'math_flash',
    bgLight: 'bg-sky-50',
    bgDark: 'dark:bg-sky-950/30',
    borderLight: 'border-sky-200',
    borderDark: 'dark:border-sky-800/50',
    gradient: 'from-sky-500 via-blue-500 to-indigo-500',
    selectedBorder: 'border-sky-500',
    shadow: 'shadow-sky-500/20',
    textColor: 'text-sky-600 dark:text-sky-400',
  },
  {
    value: 'agree_question' as ApplicationType,
    icon: '💭',
    labelKey: 'agree_question',
    bgLight: 'bg-indigo-50',
    bgDark: 'dark:bg-indigo-950/30',
    borderLight: 'border-indigo-200',
    borderDark: 'dark:border-indigo-800/50',
    gradient: 'from-indigo-500 via-purple-500 to-pink-500',
    selectedBorder: 'border-indigo-500',
    shadow: 'shadow-indigo-500/20',
    textColor: 'text-indigo-600 dark:text-indigo-400',
  },
];

export function CreateApplicationDialog({ children }: CreateApplicationDialogProps) {
  const t = useTranslations('apps.createDialog');
  const tTypes = useTranslations('apps.applicationTypes');
  const router = useRouter();

  const [open, setOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: '' as ApplicationType | '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title || !formData.type) {
      return;
    }

    setIsCreating(true);
    try {
      const response = await fetch('/api/applications', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: formData.title,
          description: formData.description || undefined,
          type: formData.type,
          config: {},
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create application');
      }

      const application = await response.json();

      // Reset form and close dialog
      setFormData({ title: '', description: '', type: '' });
      setOpen(false);

      // Refresh the page to show the new application
      router.refresh();

      // Navigate to edit page
      router.push(`/apps/applications/${application.id}/edit`);
    } catch (error) {
      console.error('Error creating application:', error);
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[540px] rounded-2xl overflow-hidden p-0 bg-white dark:bg-slate-900">
        {/* Header */}
        <div className="relative p-6 pb-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-start gap-4">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-violet-500/20 to-purple-500/20 border border-violet-500/30 flex items-center justify-center">
              <RocketLaunchIcon className="h-5 w-5 text-violet-600 dark:text-violet-400" />
            </div>
            <DialogHeader className="text-left">
              <DialogTitle className="text-xl font-semibold text-slate-900 dark:text-white">{t('title')}</DialogTitle>
              <DialogDescription className="text-slate-500 dark:text-slate-400">
                {t('description')}
              </DialogDescription>
            </DialogHeader>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="p-6 space-y-6">
            {/* Type Selection - Card based */}
            <div className="space-y-3">
              <Label className="text-sm font-medium text-slate-700 dark:text-slate-300">{t('form.type')}</Label>
              <div className="grid grid-cols-2 gap-3">
                {APP_TYPES.map((type) => (
                  <button
                    key={type.value}
                    type="button"
                    onClick={() => setFormData({ ...formData, type: type.value })}
                    className={`
                      relative p-4 rounded-xl border-2 transition-all duration-200 cursor-pointer
                      ${type.bgLight} ${type.bgDark}
                      ${formData.type === type.value
                        ? `${type.selectedBorder} ${type.shadow} shadow-lg scale-[1.02]`
                        : `${type.borderLight} ${type.borderDark} hover:scale-[1.01] hover:shadow-md`
                      }
                    `}
                  >
                    {/* Selected indicator */}
                    {formData.type === type.value && (
                      <div className={`absolute -top-1 -right-1 w-5 h-5 rounded-full bg-gradient-to-r ${type.gradient} flex items-center justify-center`}>
                        <CheckIcon className="h-3 w-3 text-white" />
                      </div>
                    )}

                    {/* Icon */}
                    <div className="text-3xl mb-2">{type.icon}</div>

                    {/* Label - i18n */}
                    <div className={`text-xs font-semibold ${type.textColor}`}>
                      {tTypes(type.labelKey)}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Title Input */}
            <div className="space-y-2">
              <Label htmlFor="title" className="text-sm font-medium text-slate-700 dark:text-slate-300">{t('form.title')}</Label>
              <Input
                id="title"
                placeholder={t('form.titlePlaceholder')}
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                required
                className="rounded-xl border-slate-200 dark:border-slate-700 focus:border-violet-400 dark:focus:border-violet-500 focus:ring-violet-400/20 transition-all"
              />
            </div>

            {/* Description Input */}
            <div className="space-y-2">
              <Label htmlFor="description" className="text-sm font-medium text-slate-700 dark:text-slate-300">{t('form.description')}</Label>
              <Textarea
                id="description"
                placeholder={t('form.descriptionPlaceholder')}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
                className="rounded-xl border-slate-200 dark:border-slate-700 focus:border-violet-400 dark:focus:border-violet-500 focus:ring-violet-400/20 transition-all resize-none"
              />
            </div>

          </div>

          <DialogFooter className="px-6 py-4 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-100 dark:border-slate-800">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={isCreating}
              className="rounded-xl border-slate-200 dark:border-slate-700"
            >
              {t('buttons.cancel')}
            </Button>
            <Button
              type="submit"
              disabled={isCreating || !formData.title || !formData.type}
              className="rounded-xl bg-violet-600 hover:bg-violet-500 text-white gap-2 shadow-lg shadow-violet-500/25"
            >
              <PlusIcon className="h-4 w-4" />
              {isCreating ? t('buttons.creating') : t('buttons.create')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
