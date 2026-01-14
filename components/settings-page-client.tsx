'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import Image from 'next/image';
import { Card } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { updateSearchableStatusAction, uploadAvatarAction, updateDisplayNameAction } from '@/app/actions/friends';
import { AvatarCropDialog } from '@/components/avatar-crop-dialog';
import { Input } from '@/components/ui/input';
import type { UserProfile } from '@/lib/types/doyouagree';
import {
  UserIcon,
  ShieldCheckIcon,
  EyeIcon,
  EyeSlashIcon,
  SparklesIcon,
  CameraIcon,
  PencilIcon,
  CheckIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';

interface SettingsPageClientProps {
  profile: UserProfile | null;
  currentDisplayName?: string | null;
}

export function SettingsPageClient({ profile, currentDisplayName }: SettingsPageClientProps) {
  const t = useTranslations('settings');
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [searchable, setSearchable] = useState(profile?.searchable ?? true);
  const [loading, setLoading] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [cropDialogOpen, setCropDialogOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [displayName, setDisplayName] = useState(currentDisplayName || '');
  const [isEditingDisplayName, setIsEditingDisplayName] = useState(false);
  const [updatingDisplayName, setUpdatingDisplayName] = useState(false);

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

  const handleDisplayNameSave = async () => {
    if (!displayName.trim()) {
      toast.error('显示名称不能为空');
      return;
    }

    setUpdatingDisplayName(true);
    const result = await updateDisplayNameAction(displayName.trim());

    if (!result.success) {
      toast.error(result.error || t('updateFailed'));
      setDisplayName(currentDisplayName || ''); // Revert on error
    } else {
      toast.success(t('displayNameUpdated'));
      setIsEditingDisplayName(false);
      // Trigger refresh to update session
      router.refresh();
      // Trigger custom event to notify AuthButton
      window.dispatchEvent(new Event('display-name-updated'));
    }

    setUpdatingDisplayName(false);
  };

  const handleDisplayNameCancel = () => {
    setDisplayName(currentDisplayName || '');
    setIsEditingDisplayName(false);
  };

  // Sync displayName state when currentDisplayName prop changes
  useEffect(() => {
    if (!isEditingDisplayName) {
      setDisplayName(currentDisplayName || '');
    }
  }, [currentDisplayName, isEditingDisplayName]);

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-gradient-to-br from-slate-50 via-white to-slate-50/50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {/* Header */}
        <div className="mb-8 sm:mb-12">
          <div className="inline-flex items-center gap-3 mb-2">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-violet-600 to-purple-600 flex items-center justify-center shadow-lg shadow-violet-500/20">
              <SparklesIcon className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-300 bg-clip-text text-transparent">
                {t('title')}
              </h1>
            </div>
          </div>
          <p className="text-slate-600 dark:text-slate-400 ml-16 text-sm sm:text-base">
            {t('subtitle')}
          </p>
        </div>

        <div className="space-y-6">
          {/* Profile Section */}
          <Card className="overflow-hidden border-0 shadow-xl shadow-slate-200/50 dark:shadow-slate-900/50 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm">
            <div className="p-6 sm:p-8">
              <div className="flex items-start gap-6 sm:gap-8">
                {/* Avatar */}
                <div className="relative group flex-shrink-0">
                  <div className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-2xl overflow-hidden ring-4 ring-slate-100 dark:ring-slate-800 shadow-lg">
                    {profile?.avatar_url ? (
                      <Image
                        src={profile.avatar_url}
                        alt={profile.full_name || 'User avatar'}
                        width={112}
                        height={112}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center">
                        <UserIcon className="h-12 w-12 text-white" />
                      </div>
                    )}
                    {uploadingAvatar && (
                      <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                        <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      </div>
                    )}
                  </div>
                  <button
                    onClick={handleAvatarClick}
                    disabled={uploadingAvatar}
                    className="absolute -bottom-1 -right-1 w-10 h-10 rounded-xl bg-gradient-to-br from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 flex items-center justify-center shadow-lg shadow-violet-500/30 transition-all duration-200 hover:scale-110 disabled:opacity-50 disabled:cursor-not-allowed group-hover:scale-105 z-10"
                  >
                    <CameraIcon className="h-5 w-5 text-white" />
                  </button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                </div>

                {/* Profile Info */}
                <div className="flex-1 min-w-0">
                  <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white mb-1">
                    {t('account.title')}
                  </h2>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
                    管理您的个人信息和账户设置
                  </p>

                  {/* Display Name */}
                  <div className="space-y-3">
                    <Label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                      {t('account.displayName')}
                    </Label>
                    {isEditingDisplayName ? (
                      <div className="flex items-center gap-2">
                        <Input
                          type="text"
                          value={displayName}
                          onChange={(e) => setDisplayName(e.target.value)}
                          placeholder={t('account.displayNamePlaceholder')}
                          maxLength={50}
                          disabled={updatingDisplayName}
                          className="flex-1 h-10 border-slate-200 dark:border-slate-700 focus:border-violet-500 focus:ring-violet-500/20"
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              handleDisplayNameSave();
                            } else if (e.key === 'Escape') {
                              handleDisplayNameCancel();
                            }
                          }}
                        />
                        <Button
                          onClick={handleDisplayNameSave}
                          disabled={updatingDisplayName}
                          size="sm"
                          className="h-10 px-4 bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 shadow-md shadow-violet-500/20"
                        >
                          {updatingDisplayName ? (
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          ) : (
                            <CheckIcon className="h-4 w-4" />
                          )}
                        </Button>
                        <Button
                          onClick={handleDisplayNameCancel}
                          disabled={updatingDisplayName}
                          size="sm"
                          variant="outline"
                          className="h-10 px-4 border-slate-200 dark:border-slate-700"
                        >
                          <XMarkIcon className="h-4 w-4" />
                        </Button>
                      </div>
                    ) : (
                        <div className="flex items-center justify-between group">
                          <div className="flex-1 min-w-0">
                            <p className="text-base font-medium text-slate-900 dark:text-white truncate">
                              {currentDisplayName || profile?.full_name || (
                                <span className="text-slate-400 dark:text-slate-500 italic">
                                  {t('account.noDisplayName')}
                                </span>
                              )}
                            </p>
                          </div>
                          <Button
                            onClick={() => setIsEditingDisplayName(true)}
                            size="sm"
                            variant="ghost"
                            className="ml-4 opacity-0 group-hover:opacity-100 transition-opacity h-8 w-8 p-0 hover:bg-slate-100 dark:hover:bg-slate-800"
                          >
                          <PencilIcon className="h-4 w-4 text-slate-500 dark:text-slate-400" />
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </Card>

          {/* Privacy Settings */}
          <Card className="overflow-hidden border-0 shadow-xl shadow-slate-200/50 dark:shadow-slate-900/50 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm">
            <div className="p-6 sm:p-8">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg shadow-emerald-500/20">
                  <ShieldCheckIcon className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
                    {t('privacy.title')}
                  </h2>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                    控制您的可见性和隐私设置
                  </p>
                </div>
              </div>

              {/* Searchable Toggle */}
              <div className="relative">
                <div className="flex items-start gap-4 p-5 rounded-xl bg-gradient-to-br from-slate-50 to-slate-100/50 dark:from-slate-800/50 dark:to-slate-800/30 border border-slate-200/50 dark:border-slate-700/50 transition-all duration-200 hover:shadow-md">
                  <div className={`flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-200 ${
                    searchable
                    ? 'bg-gradient-to-br from-emerald-500 to-teal-600 shadow-lg shadow-emerald-500/20'
                    : 'bg-slate-300 dark:bg-slate-700'
                  }`}>
                    {searchable ? (
                      <EyeIcon className="h-6 w-6 text-white" />
                    ) : (
                        <EyeSlashIcon className="h-6 w-6 text-white" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <Label
                          htmlFor="searchable"
                          className="text-base font-semibold text-slate-900 dark:text-white cursor-pointer block mb-1.5"
                        >
                          {t('privacy.searchable.label')}
                        </Label>
                        <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed mb-3">
                          {t('privacy.searchable.description')}
                        </p>
                        <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${searchable
                            ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400'
                            : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-400'
                          }`}>
                          <div className={`w-2 h-2 rounded-full ${searchable ? 'bg-emerald-500' : 'bg-slate-400'}`} />
                          {searchable ? '对所有人可见' : '仅对好友可见'}
                        </div>
                      </div>
                      <div className="flex-shrink-0 pt-1">
                        <Switch
                          id="searchable"
                          checked={searchable}
                          onCheckedChange={handleSearchableChange}
                          disabled={loading}
                          className="data-[state=checked]:bg-gradient-to-r data-[state=checked]:from-emerald-500 data-[state=checked]:to-teal-600"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Info Tip */}
              <div className="mt-6 p-4 rounded-xl bg-gradient-to-br from-blue-50 to-indigo-50/50 dark:from-blue-950/30 dark:to-indigo-950/20 border border-blue-200/50 dark:border-blue-900/30">
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-5 h-5 rounded-full bg-blue-500 dark:bg-blue-400 flex items-center justify-center mt-0.5">
                    <span className="text-white text-xs font-bold">i</span>
                  </div>
                  <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                    关闭搜索功能后，其他用户将无法在好友搜索中找到您，但您已经添加的好友仍然可以看到您。
                  </p>
                </div>
              </div>
            </div>
          </Card>
        </div>
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
