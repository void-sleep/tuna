"use client";

import { NavIconButton } from "@/components/ui/nav-icon-button";
import { MoonIcon, SunIcon } from "@heroicons/react/24/outline";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

const ThemeSwitcher = () => {
  const [mounted, setMounted] = useState(false);
  const { theme, setTheme } = useTheme();

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <div className="h-9 w-9" />;
  }

  const toggleTheme = () => {
    setTheme(theme === "light" ? "dark" : "light");
  };

  return (
    <NavIconButton
      onClick={toggleTheme}
      aria-label="Toggle theme"
      className="hover:bg-amber-500/10 dark:hover:bg-blue-500/10"
    >
      {theme === "light" ? (
        <SunIcon
          key="light"
          className="transition-transform duration-300 hover:rotate-180"
        />
      ) : (
        <MoonIcon
          key="dark"
          className="transition-transform duration-300 hover:-rotate-12"
        />
      )}
    </NavIconButton>
  );
};

export { ThemeSwitcher };
