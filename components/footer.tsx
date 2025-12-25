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

          <div className="flex flex-wrap justify-center md:justify-end gap-6 md:gap-8">
            <Link
              href="https://github.com/void-sleep/tuna"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              <FaGithub className="h-4 w-4" />
              <span>GitHub</span>
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

