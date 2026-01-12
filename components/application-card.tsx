'use client';

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTranslations, useLocale } from "next-intl";
import type { Application } from "@/lib/supabase/applications";
import type { ApplicationItem } from "@/lib/supabase/application-items";
import { Button } from "./ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "./ui/alert-dialog";
import {
  PlayIcon,
  EllipsisHorizontalIcon,
  PencilSquareIcon,
  TrashIcon,
  ClipboardDocumentListIcon,
} from "@heroicons/react/24/outline";

interface ApplicationCardProps {
  application: Application;
  index?: number;
}

// Updated to use violet for binary choice as per the design plan
const APP_TYPE_CONFIG: Record<string, {
  icon: string;
  label: string;
  bgLight: string;
  bgDark: string;
  accentLight: string;
  accentDark: string;
  borderLight: string;
  borderDark: string;
  gradient: string;
  buttonBg: string;
  buttonHover: string;
  shadow: string;
  glow: string;
}> = {
  coin: {
    icon: '🎲',
    label: 'Binary Choice',
    bgLight: 'bg-violet-50',
    bgDark: 'dark:bg-violet-950/30',
    accentLight: 'bg-violet-100',
    accentDark: 'dark:bg-violet-900/40',
    borderLight: 'border-violet-200/80',
    borderDark: 'dark:border-violet-800/30',
    gradient: 'from-violet-500 via-purple-500 to-fuchsia-500',
    buttonBg: 'bg-violet-600',
    buttonHover: 'hover:bg-violet-500',
    shadow: 'shadow-violet-500/25',
    glow: 'bg-violet-500/20',
  },
  wheel: {
    icon: '🎡',
    label: 'Wheel Spinner',
    bgLight: 'bg-amber-50',
    bgDark: 'dark:bg-amber-950/30',
    accentLight: 'bg-amber-100',
    accentDark: 'dark:bg-amber-900/40',
    borderLight: 'border-amber-200/80',
    borderDark: 'dark:border-amber-800/30',
    gradient: 'from-amber-500 via-orange-500 to-yellow-500',
    buttonBg: 'bg-amber-600',
    buttonHover: 'hover:bg-amber-500',
    shadow: 'shadow-amber-500/25',
    glow: 'bg-amber-500/20',
  },
  counter: {
    icon: '🔢',
    label: 'Counter',
    bgLight: 'bg-emerald-50',
    bgDark: 'dark:bg-emerald-950/30',
    accentLight: 'bg-emerald-100',
    accentDark: 'dark:bg-emerald-900/40',
    borderLight: 'border-emerald-200/80',
    borderDark: 'dark:border-emerald-800/30',
    gradient: 'from-emerald-500 via-green-500 to-teal-500',
    buttonBg: 'bg-emerald-600',
    buttonHover: 'hover:bg-emerald-500',
    shadow: 'shadow-emerald-500/25',
    glow: 'bg-emerald-500/20',
  },
  math_flash: {
    icon: '🧮',
    label: 'Math Flash',
    bgLight: 'bg-sky-50',
    bgDark: 'dark:bg-sky-950/30',
    accentLight: 'bg-sky-100',
    accentDark: 'dark:bg-sky-900/40',
    borderLight: 'border-sky-200/80',
    borderDark: 'dark:border-sky-800/30',
    gradient: 'from-sky-500 via-blue-500 to-indigo-500',
    buttonBg: 'bg-violet-600',
    buttonHover: 'hover:bg-violet-500',
    shadow: 'shadow-violet-500/25',
    glow: 'bg-violet-500/20',
  },
  agree_question: {
    icon: '💭',
    label: 'Do You Agree',
    bgLight: 'bg-indigo-50',
    bgDark: 'dark:bg-indigo-950/30',
    accentLight: 'bg-indigo-100',
    accentDark: 'dark:bg-indigo-900/40',
    borderLight: 'border-indigo-200/80',
    borderDark: 'dark:border-indigo-800/30',
    gradient: 'from-indigo-500 via-purple-500 to-pink-500',
    buttonBg: 'bg-violet-600',
    buttonHover: 'hover:bg-violet-500',
    shadow: 'shadow-violet-500/25',
    glow: 'bg-violet-500/20',
  },
};

export function ApplicationCard({ application, index = 0 }: ApplicationCardProps) {
  const t = useTranslations('apps');
  const locale = useLocale();
  const router = useRouter();
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [items, setItems] = useState<ApplicationItem[]>([]);
  const [isHovered, setIsHovered] = useState(false);

  const config = APP_TYPE_CONFIG[application.type] || APP_TYPE_CONFIG.coin;

  // Fetch application items for preview
  useEffect(() => {
    async function fetchItems() {
      try {
        const response = await fetch(`/api/applications/${application.id}/items`);
        if (response.ok) {
          const data = await response.json();
          setItems(data);
        }
      } catch (error) {
        console.error('Error fetching items:', error);
      }
    }
    fetchItems();
  }, [application.id]);

  // Format date based on locale
  const createdDate = new Date(application.created_at);
  const dateLocale = locale === 'zh' ? 'zh-CN' : locale;
  const formattedDate = createdDate.toLocaleDateString(dateLocale, {
    month: 'short',
    day: 'numeric',
  });

  // Get localized application type label
  const typeKey = application.type as 'coin' | 'wheel' | 'counter' | 'math_flash';
  const localizedTypeLabel = t(`applicationTypes.${typeKey}`);

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      const response = await fetch(`/api/applications/${application.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete application');
      }

      router.refresh();
    } catch (error) {
      console.error('Error deleting application:', error);
    } finally {
      setIsDeleting(false);
      setIsDeleteDialogOpen(false);
    }
  };

  // Get options for preview
  const optionA = items.find(item => item.position === 0);
  const optionB = items.find(item => item.position === 1);

  return (
    <>
      <div
        className={`
          group relative overflow-hidden rounded-2xl h-full
          bg-white dark:bg-slate-800/60
          border border-slate-200/80 dark:border-slate-700/50
          hover:border-transparent
          hover:shadow-xl ${isHovered ? config.shadow : 'hover:shadow-slate-200/50 dark:hover:shadow-slate-900/50'}
          transition-all duration-300 ease-out
        `}
        style={{ animationDelay: `${index * 50}ms` }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Animated gradient border on hover */}
        <div
          className={`
            absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300
            bg-gradient-to-r ${config.gradient} p-[1px]
          `}
        >
          <div className="absolute inset-[1px] rounded-2xl bg-white dark:bg-slate-800" />
        </div>

        {/* Decorative background pattern */}
        <div className={`absolute top-0 right-0 w-32 h-32 ${config.accentLight} ${config.accentDark} rounded-full blur-3xl opacity-50 -translate-y-1/2 translate-x-1/2 transition-opacity group-hover:opacity-80`} />

        {/* Content */}
        <div className="relative p-5 h-full flex flex-col">
          {/* Top row: Icon, Type badge, Menu */}
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              {/* Icon container with layered design */}
              <div className="relative">
                <div className={`w-12 h-12 rounded-xl ${config.bgLight} ${config.bgDark} border ${config.borderLight} ${config.borderDark} flex items-center justify-center text-2xl transition-all duration-300 group-hover:scale-110 group-hover:rotate-3 group-hover:shadow-lg ${config.shadow}`}>
                  {config.icon}
                </div>
              </div>
              {/* Type label */}
              <div>
                <span className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide">
                  {localizedTypeLabel}
                </span>
              </div>
            </div>

            {/* Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <EllipsisHorizontalIcon className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="rounded-xl w-40">
                <DropdownMenuItem asChild className="rounded-lg cursor-pointer">
                  <Link href={`/apps/applications/${application.id}/edit`}>
                    <PencilSquareIcon className="h-4 w-4 mr-2" />
                    {t('actions.edit')}
                  </Link>
                </DropdownMenuItem>
                {application.type === 'agree_question' && (
                  <DropdownMenuItem asChild className="rounded-lg cursor-pointer">
                    <Link href={`/apps/questions?app=${application.id}`}>
                      <ClipboardDocumentListIcon className="h-4 w-4 mr-2" />
                      查看记录
                    </Link>
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem
                  className="text-red-600 focus:text-red-600 dark:text-red-400 rounded-lg cursor-pointer"
                  onClick={() => setIsDeleteDialogOpen(true)}
                >
                  <TrashIcon className="h-4 w-4 mr-2" />
                  {t('actions.delete')}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Title */}
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-1.5 line-clamp-1 group-hover:text-slate-700 dark:group-hover:text-slate-100 transition-colors">
            {application.title}
          </h3>

          {/* Description - flex-1 to fill available space */}
          <div className="flex-1">
            <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-2 min-h-[2.5rem] mb-3">
              {application.description}
            </p>

            {/* Options preview for binary choice */}
            {application.type === 'coin' && optionA && optionB && (
              <div className="flex items-center gap-2 mb-4 p-2 rounded-lg bg-slate-50 dark:bg-slate-700/30 border border-slate-100 dark:border-slate-700/50">
                <div className="flex-1 flex items-center gap-1.5 text-xs">
                  <span className="text-base">{optionA.icon}</span>
                  <span className="text-slate-600 dark:text-slate-300 truncate font-medium">{optionA.text}</span>
                </div>
                <span className="text-violet-500 text-xs font-bold">VS</span>
                <div className="flex-1 flex items-center gap-1.5 text-xs justify-end">
                  <span className="text-slate-600 dark:text-slate-300 truncate font-medium">{optionB.text}</span>
                  <span className="text-base">{optionB.icon}</span>
                </div>
              </div>
            )}
          </div>

          {/* Bottom row: Date and Actions - mt-auto pushes to bottom */}
          <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-700/50 mt-auto">
            <span className="text-xs text-slate-400 dark:text-slate-500">
              {formattedDate}
            </span>

            <div className="flex items-center gap-2">
              {/* Edit button */}
              <Button
                variant="ghost"
                size="sm"
                asChild
                className="h-8 px-3 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              >
                <Link href={`/apps/applications/${application.id}/edit`}>
                  <PencilSquareIcon className="h-4 w-4" />
                </Link>
              </Button>

              {/* Run button with glow effect */}
              <div className="relative">
                {isHovered && (
                  <div className={`absolute inset-0 ${config.glow} rounded-lg blur-md animate-pulse`} />
                )}
                <Button
                  size="sm"
                  asChild
                  className={`relative h-8 px-4 gap-1.5 ${config.buttonBg} ${config.buttonHover} text-white rounded-lg transition-all shadow-lg ${config.shadow} hover:shadow-xl`}
                >
                  <Link href={`/applications/${application.id}/run`}>
                    <PlayIcon className="h-3.5 w-3.5" />
                    {t('actions.run')}
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent className="rounded-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle>{t('deleteDialog.title')}</AlertDialogTitle>
            <AlertDialogDescription>
              {t('deleteDialog.description')}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-xl">
              {t('deleteDialog.buttons.cancel')}
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-red-600 text-white hover:bg-red-700 rounded-xl"
            >
              {isDeleting ? t('deleteDialog.buttons.deleting') : t('deleteDialog.buttons.delete')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
