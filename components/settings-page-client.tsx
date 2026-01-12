'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { Card } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { updateSearchableStatusAction, uploadAvatarAction } from '@/app/actions/friends';
import type { UserProfile } from '@/lib/types/doyouagree';
import {
  UserIcon,
  ShieldCheckIcon,
  EyeIcon,
  EyeSlashIcon,
  SparklesIcon,
  CameraIcon
} from '@heroicons/react/24/outline';

interface SettingsPageClientProps {
  profile: UserProfile | null;
}

export function SettingsPageClient({ profile }: SettingsPageClientProps) {
  const t = useTranslations('settings');
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [searchable, setSearchable] = useState(profile?.searchable ?? true);
  const [loading, setLoading] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

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

  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploadingAvatar(true);

    const formData = new FormData();
    formData.append('avatar', file);

    const result = await uploadAvatarAction(formData);

    if (result.success) {
      toast.success('头像更新成功');
      router.refresh();
    } else {
      toast.error(result.error || '头像上传失败');
    }

    setUploadingAvatar(false);

    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-violet-50/30 to-purple-50/30 dark:from-slate-950 dark:via-violet-950/10 dark:to-purple-950/10">
      <div className="container max-w-4xl px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-6 sm:space-y-8">
        {/* Header with Icon */}
        <div className="relative px-2">
          <div className="absolute -top-4 -left-4 w-24 h-24 bg-gradient-to-br from-violet-500/20 to-purple-500/20 rounded-full blur-3xl" />
          <div className="relative space-y-3">
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-violet-600 to-purple-600 flex items-center justify-center shadow-lg shadow-violet-500/25">
                <SparklesIcon className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-violet-600 via-purple-600 to-fuchsia-600 bg-clip-text text-transparent">
                  {t('title')}
                </h1>
                <p className="text-slate-600 dark:text-slate-400 mt-1">
                  {t('subtitle')}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Account Info Card */}
        <Card className="p-6 sm:p-8 border-2 border-violet-100 dark:border-violet-900/50 bg-gradient-to-br from-white via-violet-50/30 to-purple-50/30 dark:from-slate-900 dark:via-violet-950/20 dark:to-purple-950/20 shadow-xl shadow-violet-500/5 relative overflow-hidden">
          {/* Background decoration */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-violet-500/10 to-purple-500/10 rounded-full blur-3xl -z-10" />

          <div className="space-y-6">
            {/* Avatar Section */}
            <div className="flex items-start gap-6">
              <div className="relative group">
                <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center flex-shrink-0 shadow-lg shadow-violet-500/25 overflow-hidden">
                  {profile?.avatar_url ? (
                    <img
                      src={profile.avatar_url}
                      alt={profile.full_name || 'User avatar'}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <UserIcon className="h-12 w-12 text-white" />
                  )}
                </div>
                <button
                  onClick={handleAvatarClick}
                  disabled={uploadingAvatar}
                  className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl flex items-center justify-center cursor-pointer disabled:cursor-not-allowed"
                >
                  <CameraIcon className="h-8 w-8 text-white" />
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarUpload}
                  className="hidden"
                />
              </div>

              <div className="flex-1 space-y-4">
                <div>
                  <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-1 flex items-center gap-2">
                    {t('account.title')}
                  </h2>
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    您的个人信息和账户详情
                  </p>
                </div>

                {profile?.full_name && (
                  <div className="p-4 rounded-xl bg-gradient-to-br from-slate-50 to-violet-50/50 dark:from-slate-800 dark:to-violet-900/20 border border-violet-100 dark:border-violet-900/30">
                    <p className="text-sm text-slate-500 dark:text-slate-400 mb-1">
                      {t('account.displayName')}
                    </p>
                    <p className="text-lg font-semibold text-slate-900 dark:text-white">
                      {profile.full_name}
                    </p>
                  </div>
                )}

                <Button
                  onClick={handleAvatarClick}
                  disabled={uploadingAvatar}
                  variant="outline"
                  size="sm"
                  className="gap-2"
                >
                  <CameraIcon className="h-4 w-4" />
                  {uploadingAvatar ? '上传中...' : (profile?.avatar_url ? '更换头像' : '上传头像')}
                </Button>
              </div>
            </div>
          </div>
        </Card>

        {/* Privacy Settings Card */}
        <Card className="p-6 sm:p-8 border-2 border-purple-100 dark:border-purple-900/50 bg-gradient-to-br from-white via-purple-50/30 to-pink-50/30 dark:from-slate-900 dark:via-purple-950/20 dark:to-pink-950/20 shadow-xl shadow-purple-500/5 relative overflow-hidden">
          {/* Background decoration */}
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-gradient-to-tr from-purple-500/10 to-pink-500/10 rounded-full blur-3xl -z-10" />

          <div className="space-y-6">
            <div className="flex items-start gap-4">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center flex-shrink-0 shadow-lg shadow-purple-500/25">
                <ShieldCheckIcon className="h-7 w-7 text-white" />
              </div>
              <div className="flex-1">
                <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-1">
                  {t('privacy.title')}
                </h2>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  管理您的隐私设置和可见性选项
                </p>
              </div>
            </div>

            {/* Privacy Toggle */}
            <div className="p-5 sm:p-6 rounded-2xl bg-gradient-to-br from-white to-purple-50/50 dark:from-slate-800 dark:to-purple-900/20 border-2 border-purple-100 dark:border-purple-900/30 hover:border-purple-200 dark:hover:border-purple-800/50 transition-all duration-200">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 sm:gap-6">
                <div className="flex items-start gap-4 flex-1">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-colors ${
                    searchable
                      ? 'bg-gradient-to-br from-green-500 to-emerald-600 shadow-lg shadow-green-500/25'
                      : 'bg-gradient-to-br from-slate-400 to-slate-500 shadow-lg shadow-slate-500/25'
                  }`}>
                    {searchable ? (
                      <EyeIcon className="h-6 w-6 text-white" />
                    ) : (
                      <EyeSlashIcon className="h-6 w-6 text-white" />
                    )}
                  </div>
                  <div className="flex-1 space-y-2">
                    <Label
                      htmlFor="searchable"
                      className="text-base font-semibold text-slate-900 dark:text-white cursor-pointer"
                    >
                      {t('privacy.searchable.label')}
                    </Label>
                    <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                      {t('privacy.searchable.description')}
                    </p>
                    <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium ${
                      searchable
                        ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-400'
                    }`}>
                      <div className={`w-2 h-2 rounded-full ${searchable ? 'bg-green-500' : 'bg-slate-400'}`} />
                      {searchable ? '对所有人可见' : '仅对好友可见'}
                    </div>
                  </div>
                </div>
                <div className="flex-shrink-0">
                  <Switch
                    id="searchable"
                    checked={searchable}
                    onCheckedChange={handleSearchableChange}
                    disabled={loading}
                    className="data-[state=checked]:bg-gradient-to-r data-[state=checked]:from-green-500 data-[state=checked]:to-emerald-600"
                  />
                </div>
              </div>
            </div>

            {/* Privacy Tips */}
            <div className="p-4 rounded-xl bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 border border-blue-200 dark:border-blue-900/30">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-blue-500 flex items-center justify-center flex-shrink-0">
                  <SparklesIcon className="h-4 w-4 text-white" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-blue-900 dark:text-blue-300 mb-1">
                    隐私提示
                  </p>
                  <p className="text-xs text-blue-700 dark:text-blue-400">
                    关闭搜索功能后，其他用户将无法在好友搜索中找到您，但您已经添加的好友仍然可以看到您。
                  </p>
                </div>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
