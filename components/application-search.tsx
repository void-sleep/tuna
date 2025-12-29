'use client';

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import type { Application } from "@/lib/supabase/applications";
import { Button } from "./ui/button";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "./ui/dialog";
import { Input } from "./ui/input";
import { MagnifyingGlassIcon, PlayIcon, PencilSquareIcon } from "@heroicons/react/24/outline";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";

interface ApplicationSearchProps {
  applications: Application[];
}

const APP_TYPE_CONFIG: Record<string, { icon: string; label: string }> = {
  coin: { icon: '🎲', label: 'Binary Choice' },
  wheel: { icon: '🎡', label: 'Wheel Spinner' },
  counter: { icon: '🔢', label: 'Counter' },
};

export function ApplicationSearch({ applications }: ApplicationSearchProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");

  // Keyboard shortcut
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };

    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  const filteredApps = applications.filter((app) => {
    const searchLower = search.toLowerCase();
    return (
      app.title.toLowerCase().includes(searchLower) ||
      app.description?.toLowerCase().includes(searchLower) ||
      app.type.toLowerCase().includes(searchLower)
    );
  });

  const handleSelect = (app: Application, action: 'run' | 'edit') => {
    setOpen(false);
    setSearch("");
    if (action === 'run') {
      router.push(`/applications/${app.id}/run`);
    } else {
      router.push(`/apps/applications/${app.id}/edit`);
    }
  };

  return (
    <>
      <Button
        variant="outline"
        onClick={() => setOpen(true)}
        className="gap-2 bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white px-4 h-9 min-w-[180px] md:min-w-[220px] justify-start"
      >
        <MagnifyingGlassIcon className="h-4 w-4" />
        <span className="text-sm flex-1 text-left">Search...</span>
        <kbd className="hidden md:inline-flex h-5 items-center gap-1 rounded border bg-slate-100 dark:bg-slate-700 px-1.5 font-mono text-[10px] font-medium text-slate-500 dark:text-slate-400">
          <span className="text-xs">⌘</span>K
        </kbd>
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="overflow-hidden p-0 rounded-2xl max-w-lg bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
          <VisuallyHidden>
            <DialogTitle>Search Applications</DialogTitle>
          </VisuallyHidden>
          {/* Search Input */}
          <div className="flex items-center border-b border-slate-200 dark:border-slate-800 px-4">
            <MagnifyingGlassIcon className="h-5 w-5 text-slate-400 shrink-0" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search applications..."
              className="h-14 border-0 focus-visible:ring-0 focus-visible:ring-offset-0 text-base placeholder:text-slate-400"
              autoFocus
            />
          </div>

          {/* Results */}
          <div className="max-h-[300px] overflow-y-auto p-2">
            {filteredApps.length === 0 ? (
              <div className="py-8 text-center text-slate-500 dark:text-slate-400">
                <p className="text-sm">No applications found</p>
              </div>
            ) : (
              <div className="space-y-1">
                {filteredApps.map((app) => {
                  const config = APP_TYPE_CONFIG[app.type] || APP_TYPE_CONFIG.coin;
                  return (
                    <div
                      key={app.id}
                      className="group flex items-center justify-between gap-3 px-3 py-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                      onClick={() => handleSelect(app, 'run')}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <span className="text-xl shrink-0">{config.icon}</span>
                        <div className="min-w-0">
                          <p className="font-medium text-slate-900 dark:text-white truncate">
                            {app.title}
                          </p>
                          <p className="text-xs text-slate-500 dark:text-slate-400">
                            {config.label}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleSelect(app, 'edit');
                          }}
                        >
                          <PencilSquareIcon className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleSelect(app, 'run');
                          }}
                        >
                          <PlayIcon className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Footer hint */}
          <div className="flex items-center justify-between border-t border-slate-200 dark:border-slate-800 px-4 py-2 text-xs text-slate-400">
            <span>Press Enter to run</span>
            <span>ESC to close</span>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
