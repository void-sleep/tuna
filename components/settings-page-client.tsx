'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import Image from 'next/image';
import { Card } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { updateSearchableStatusAction, uploadAvatarAction } from '@/app/actions/friends';
import { AvatarCropDialog } from '@/components/avatar-crop-dialog';
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
  const [cropDialogOpen, setCropDialogOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

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

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('请选择图片文件');
      return;
    }

    // Validate file size (max 5MB before crop)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('图片大小不能超过5MB');
      return;
    }

    // Read file as data URL for cropper
    const reader = new FileReader();
    reader.addEventListener('load', () => {
      setSelectedImage(reader.result as string);
      setCropDialogOpen(true);
    });
    reader.readAsDataURL(file);

    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleCropComplete = async (croppedImage: Blob) => {
    setUploadingAvatar(true);

    const formData = new FormData();
    formData.append('avatar', croppedImage, 'avatar.jpg');

    const result = await uploadAvatarAction(formData);

    if (result.success) {
      toast.success('头像更新成功');
      // Trigger custom event to notify AuthButton
      window.dispatchEvent(new Event('avatar-updated'));
      router.refresh();
    } else {
      toast.error(result.error || '头像上传失败');
    }

    setUploadingAvatar(false);
    setSelectedImage(null);
  };

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-slate-50/50 dark:bg-slate-950">
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-8 space-y-8">
        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-violet-600 flex items-center justify-center">
            <SparklesIcon className="h-5 w-5 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
              {t('title')}
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              {t('subtitle')}
            </p>
          </div>
        </div>

        {/* Account Info Card */}
        <Card className="p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">

          <div className="space-y-6">
            {/* Avatar Section */}
            <div className="flex items-start gap-6">
              <div className="relative group">
                <div className="w-20 h-20 rounded-xl bg-violet-600 flex items-center justify-center flex-shrink-0 overflow-hidden">
                  {profile?.avatar_url ? (
                    <Image
                      src={profile.avatar_url}
                      alt={profile.full_name || 'User avatar'}
                      width={80}
                      height={80}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <UserIcon className="h-10 w-10 text-white" />
                  )}
                </div>
                <button
                  onClick={handleAvatarClick}
                  disabled={uploadingAvatar}
                  className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-xl flex items-center justify-center cursor-pointer disabled:cursor-not-allowed"
                >
                  <CameraIcon className="h-6 w-6 text-white" />
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileSelect}
                  className="hidden"
                />
              </div>

              <div className="flex-1 space-y-3">
                <div>
                  <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
                    {t('account.title')}
                  </h2>
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    您的个人信息和账户详情
                  </p>
                </div>

                {profile?.full_name && (
                  <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                    <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">
                      {t('account.displayName')}
                    </p>
                    <p className="text-base font-medium text-slate-900 dark:text-white">
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
        <Card className="p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-violet-600 flex items-center justify-center">
                <ShieldCheckIcon className="h-5 w-5 text-white" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
                  {t('privacy.title')}
                </h2>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  管理您的隐私设置和可见性选项
                </p>
              </div>
            </div>

            {/* Privacy Toggle */}
            <div className="p-4 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 sm:gap-6">
                <div className="flex items-start gap-4 flex-1">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center transition-colors ${
                    searchable
                      ? 'bg-green-500'
                      : 'bg-slate-400'
                  }`}>
                    {searchable ? (
                      <EyeIcon className="h-5 w-5 text-white" />
                    ) : (
                      <EyeSlashIcon className="h-5 w-5 text-white" />
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
            <div className="p-4 rounded-lg bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900/30">
              <p className="text-sm text-slate-600 dark:text-slate-400">
                💡 关闭搜索功能后，其他用户将无法在好友搜索中找到您，但您已经添加的好友仍然可以看到您。
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Avatar Crop Dialog */}
      {selectedImage && (
        <AvatarCropDialog
          open={cropDialogOpen}
          onOpenChange={setCropDialogOpen}
          imageSrc={selectedImage}
          onCropComplete={handleCropComplete}
        />
      )}
    </div>
  );
}
