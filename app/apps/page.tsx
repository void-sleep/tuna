import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getApplications } from "@/lib/supabase/applications";
import { getTranslations } from "next-intl/server";
import { ApplicationCard } from "@/components/application-card";
import { CreateApplicationDialog } from "@/components/create-application-dialog";
import { ApplicationSearch } from "@/components/application-search";
import { PlusIcon, SparklesIcon, Squares2X2Icon } from "@heroicons/react/24/outline";
import { Button } from "@/components/ui/button";

export default async function AppsPage() {
  const supabase = await createClient();
  const t = await getTranslations('apps');

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    redirect("/auth/login");
  }

  const applications = await getApplications();

  // Count applications by type
  const typeCounts = applications.reduce((acc, app) => {
    acc[app.type] = (acc[app.type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const typeIcons: Record<string, string> = {
    coin: '🎲',
    wheel: '🎡',
    counter: '🔢',
    math_flash: '🧮',
    agree_question: '💭',
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-slate-50/50 dark:bg-slate-950">
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-violet-600 flex items-center justify-center">
              <Squares2X2Icon className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
                {t('title')}
              </h1>
              <div className="flex items-center gap-3 text-sm text-slate-500 dark:text-slate-400">
                <span>{applications.length}</span>
                {Object.keys(typeCounts).length > 0 && (
                  <span className="flex items-center gap-2">
                    <span className="text-slate-300 dark:text-slate-600">|</span>
                    {Object.entries(typeCounts).map(([type, count]) => (
                      <span key={type} className="flex items-center gap-1">
                        <span>{typeIcons[type]}</span>
                        <span>{count}</span>
                      </span>
                    ))}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Search and Create */}
          <div className="flex items-center gap-3">
            {applications.length > 0 && <ApplicationSearch applications={applications} />}
            <CreateApplicationDialog>
              <Button
                className="gap-2 bg-violet-600 hover:bg-violet-500 text-white shadow-lg shadow-violet-500/25"
              >
                <PlusIcon className="h-4 w-4" />
                <span className="hidden sm:inline">{t('createNew')}</span>
                <span className="sm:hidden">New</span>
              </Button>
            </CreateApplicationDialog>
          </div>
        </div>

        {/* Applications Grid */}
        {applications.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 px-4">
            <div className="relative mb-8">
              <div className="absolute inset-0 bg-slate-200/50 dark:bg-slate-700/30 rounded-full blur-2xl" />
              <div className="relative w-24 h-24 rounded-2xl bg-white dark:bg-slate-800 border-2 border-dashed border-slate-300 dark:border-slate-600 flex items-center justify-center shadow-sm">
                <SparklesIcon className="h-10 w-10 text-slate-400" />
              </div>
            </div>
            <h2 className="text-2xl font-bold mb-3 text-center text-slate-900 dark:text-white">{t('empty.title')}</h2>
            <p className="text-slate-500 dark:text-slate-400 mb-8 max-w-sm text-center">
              {t('empty.description')}
            </p>
            <CreateApplicationDialog>
              <Button
                size="lg"
                className="gap-2 bg-violet-600 hover:bg-violet-500 text-white shadow-lg shadow-violet-500/25"
              >
                <PlusIcon className="h-5 w-5" />
                {t('empty.cta')}
              </Button>
            </CreateApplicationDialog>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
            {applications.map((app, index) => (
              <ApplicationCard key={app.id} application={app} index={index} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
