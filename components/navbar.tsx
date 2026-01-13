'use client';

import Link from "next/link";
import Image from "next/image";
import { ThemeSwitcher } from "./theme-switcher";
import { AuthButton } from "./auth-button";
import { LanguageSwitcher } from "./language-switcher";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();
  const isHomePage = pathname === '/';
  const t = useTranslations('nav');
  const tCommon = useTranslations('common');

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-background/80 backdrop-blur-xl shadow-lg shadow-black/5 border-b border-border/50'
          : 'bg-transparent'
      }`}
    >
      <nav className="h-16 px-4 md:px-8 lg:px-12">
        <div className="h-full max-w-7xl mx-auto flex items-center justify-between">
          {/* Logo - Left side */}
          <Link
            href="/"
            className="flex items-center gap-2.5 group"
          >
            <div className="relative">
              <div className="absolute -inset-1 bg-gradient-to-r from-violet-500/20 to-purple-500/20 rounded-xl blur opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <Image
                src="/logo.png"
                alt={tCommon('appName')}
                width={32}
                height={32}
                className="relative h-8 w-8 rounded-lg object-contain transition-transform duration-300 group-hover:scale-110"
                priority
              />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent group-hover:from-violet-600 group-hover:to-purple-600 transition-all duration-300">
              {tCommon('appName')}
            </span>
          </Link>

          {/* Center Navigation - Only on home page, hidden on mobile */}
          {isHomePage && (
            <div className="hidden md:flex items-center gap-1">
              <NavLink href="#use-cases">{t('features')}</NavLink>
              <NavLink href="/pricing">{t('pricing')}</NavLink>
              <NavLink href="https://blog.voidsleep.com" external>Blog</NavLink>
              <NavLink href="https://github.com/l10178/tuna" external>GitHub</NavLink>
            </div>
          )}

          {/* Right side actions */}
          <div className="flex items-center gap-1.5">
            <LanguageSwitcher />
            <ThemeSwitcher />
            <div className="w-px h-6 bg-border/50 mx-1 hidden sm:block" />
            <AuthButton />
          </div>
        </div>
      </nav>
    </header>
  );
}

function NavLink({
  href,
  children,
  external = false,
}: {
  href: string;
  children: React.ReactNode;
  external?: boolean;
}) {
  const linkProps = external
    ? { target: "_blank", rel: "noopener noreferrer" }
    : {};

  return (
    <Link
      href={href}
      className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors duration-200 rounded-lg hover:bg-accent/50"
      {...linkProps}
    >
      {children}
    </Link>
  );
}
