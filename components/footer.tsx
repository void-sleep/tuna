'use client';

import Link from "next/link";
import { FaGithub } from "react-icons/fa";
import { useTranslations } from "next-intl";

export function Footer() {
  const currentYear = new Date().getFullYear();
  const t = useTranslations('footer');

  return (
    <footer className="w-full border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto max-w-7xl px-6 md:px-12 lg:px-16 py-6 md:py-8">
        <div className="flex flex-col md:flex-row justify-between items-center gap-6 md:gap-8">
          <div className="flex flex-col items-center md:items-start gap-2 text-center md:text-left">
            <p className="text-xs text-muted-foreground">
              © {currentYear} Void Sleep. {t('allRightsReserved')}.
            </p>
          </div>

          <div className="flex flex-wrap justify-center md:justify-end gap-4 md:gap-6">
            <Link
              href="/about"
              className="text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              {t('about')}
            </Link>
            <Link
              href="/terms"
              className="text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              {t('terms')}
            </Link>
            <Link
              href="/privacy"
              className="text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              {t('privacy')}
            </Link>
            <Link
              href="https://github.com/l10178/tuna"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              <FaGithub className="h-3.5 w-3.5" />
              <span>GitHub</span>
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

