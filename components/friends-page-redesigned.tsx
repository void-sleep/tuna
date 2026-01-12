'use client';

import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import type { FriendWithUser } from '@/lib/types/doyouagree';
import { UnifiedFriendsList } from '@/components/friends-list-unified';
import { UserSearchInput } from '@/components/user-search-input';
import { Card } from '@/components/ui/card';
import {
  UserGroupIcon,
  MagnifyingGlassIcon,
  UsersIcon,
  BellAlertIcon,
  PaperAirplaneIcon,
} from '@heroicons/react/24/outline';

interface FriendsPageRedesignedProps {
  friends: FriendWithUser[];
  receivedRequests: FriendWithUser[];
  sentRequests: FriendWithUser[];
}

export function FriendsPageRedesigned({ friends, receivedRequests, sentRequests }: FriendsPageRedesignedProps) {
  const t = useTranslations('friends');
  const router = useRouter();

  const totalCount = friends.length + receivedRequests.length + sentRequests.length;

  const handleRequestSent = () => {
    router.refresh();
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-slate-50/50 dark:bg-slate-950">
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-8 space-y-8">
        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-violet-600 flex items-center justify-center">
            <UserGroupIcon className="h-5 w-5 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
              {t('title')}
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              {totalCount > 0 ? `共 ${totalCount} 个联系人` : '开始添加你的第一个好友'}
            </p>
          </div>
        </div>

        {/* Search Section */}
        <Card className="p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-violet-600 flex items-center justify-center">
                <MagnifyingGlassIcon className="h-5 w-5 text-white" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
                  搜索新好友
                </h2>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  通过名称或邮箱查找并添加好友
                </p>
              </div>
            </div>

            <UserSearchInput onRequestSent={handleRequestSent} />
          </div>
        </Card>

        {/* Friends List Section */}
        <div className="space-y-4">
          {receivedRequests.length > 0 && (
            <div className="flex items-center gap-3 p-4 rounded-lg bg-orange-50 dark:bg-orange-950/20 border border-orange-200 dark:border-orange-900/30">
              <BellAlertIcon className="h-5 w-5 text-orange-600 dark:text-orange-400" />
              <p className="text-sm text-slate-700 dark:text-slate-300">
                {receivedRequests.length} 个好友请求待处理
              </p>
            </div>
          )}

          {totalCount > 0 ? (
            <Card className="p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                  <UsersIcon className="h-5 w-5 text-slate-500 dark:text-slate-400" />
                  我的联系人
                </h2>
                <span className="text-sm text-slate-500 dark:text-slate-400">
                  共 {totalCount} 位
                </span>
              </div>
              <UnifiedFriendsList
                friends={friends}
                receivedRequests={receivedRequests}
                sentRequests={sentRequests}
              />
            </Card>
          ) : (
            <Card className="p-8 sm:p-12 lg:p-16 border-2 border-dashed border-slate-200 dark:border-slate-800 bg-gradient-to-br from-slate-50 to-white dark:from-slate-900 dark:to-slate-800 text-center">
              <div className="relative inline-block mb-6">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 to-indigo-500/20 rounded-full blur-2xl" />
                <div className="relative w-20 h-20 rounded-full bg-gradient-to-br from-blue-500/10 to-indigo-500/10 border-2 border-dashed border-blue-500/30 flex items-center justify-center">
                  <UserGroupIcon className="h-10 w-10 text-blue-400" />
                </div>
              </div>
              <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">
                还没有好友
              </h3>
              <p className="text-slate-600 dark:text-slate-400 max-w-md mx-auto">
                使用上方的搜索功能查找并添加你的第一个好友，开始交流吧！
              </p>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
