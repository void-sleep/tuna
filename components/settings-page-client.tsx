'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Card } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { updateSearchableStatusAction } from '@/app/actions/friends';
import type { UserProfile } from '@/lib/types/doyouagree';

interface SettingsPageClientProps {
  profile: UserProfile | null;
}

export function SettingsPageClient({ profile }: SettingsPageClientProps) {
  const t = useTranslations('settings');
  const [searchable, setSearchable] = useState(profile?.searchable ?? true);
  const [loading, setLoading] = useState(false);

  const handleSearchableChange = async (checked: boolean) => {
    setLoading(true);
    setSearchable(checked);

    const result = await updateSearchableStatusAction(checked);

    if (!result.success) {
      toast.error(result.error || t('updateFailed'));
      setSearchable(!checked); // Revert on error
    } else {
      toast.success(t('searchableUpdated'));
    }

    setLoading(false);
  };

  return (
    <div className="container max-w-2xl py-8 space-y-8">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white">{t('title')}</h1>
        <p className="text-slate-600 dark:text-slate-400">
          {t('subtitle')}
        </p>
      </div>

      {/* Privacy Settings */}
      <Card className="p-6 space-y-6">
        <div>
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
            {t('privacy.title')}
          </h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between gap-4">
              <div className="flex-1 space-y-1">
                <Label htmlFor="searchable" className="text-base font-medium">
                  {t('privacy.searchable.label')}
                </Label>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  {t('privacy.searchable.description')}
                </p>
              </div>
              <Switch
                id="searchable"
                checked={searchable}
                onCheckedChange={handleSearchableChange}
                disabled={loading}
              />
            </div>
          </div>
        </div>
      </Card>

      {/* Account Info */}
      <Card className="p-6 space-y-4">
        <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
          {t('account.title')}
        </h2>
        <div className="space-y-3">
          {profile?.full_name && (
            <div>
              <p className="text-sm text-slate-500 dark:text-slate-400">{t('account.displayName')}</p>
              <p className="font-medium">{profile.full_name}</p>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}
