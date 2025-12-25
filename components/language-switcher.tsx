'use client';

import { useLocale } from "next-intl";
import { useRouter } from "next/navigation";
import { NavIconButton } from "./ui/nav-icon-button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { GlobeAltIcon, CheckIcon } from "@heroicons/react/24/outline";
import { locales, LOCALE_NAMES, type Locale } from "@/lib/i18n-config";

export function LanguageSwitcher() {
  const locale = useLocale();
  const router = useRouter();

  const handleChangeLocale = (newLocale: Locale) => {
    document.cookie = `NEXT_LOCALE=${newLocale}; path=/; max-age=31536000`;
    router.refresh();
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <NavIconButton
          aria-label="Change language"
          className="hover:bg-blue-500/10"
        >
          <GlobeAltIcon />
        </NavIconButton>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-40 rounded-xl p-1">
        {locales.map((loc) => (
          <DropdownMenuItem
            key={loc}
            onClick={() => handleChangeLocale(loc)}
            className={`flex items-center justify-between rounded-lg cursor-pointer ${
              locale === loc ? 'bg-accent' : ''
            }`}
          >
            <span>{LOCALE_NAMES[loc]}</span>
            {locale === loc && (
              <CheckIcon className="h-4 w-4 text-violet-500" />
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
