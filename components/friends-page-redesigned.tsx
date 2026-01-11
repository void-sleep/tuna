'use client';

import { useTranslations } from 'next-intl';
import type { FriendWithUser } from '@/lib/types/doyouagree';
import { UnifiedFriendsList } from '@/components/friends-list-unified';
import { UserSearchInput } from '@/components/user-search-input';
import { Card } from '@/components/ui/card';

interface FriendsPageRedesignedProps {
  friends: FriendWithUser[];
  receivedRequests: FriendWithUser[];
  sentRequests: FriendWithUser[];
}

export function FriendsPageRedesigned({ friends, receivedRequests, sentRequests }: FriendsPageRedesignedProps) {
  const t = useTranslations('friends');

  const totalCount = friends.length + receivedRequests.length + sentRequests.length;

  return (
    <div className="container max-w-4xl py-8 space-y-8">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white">{t('title')}</h1>
        <p className="text-slate-600 dark:text-slate-400">
          {totalCount > 0 ? `共 ${totalCount} 个联系人` : '开始添加你的第一个好友'}
        </p>
      </div>

      {/* Search Section */}
      <Card className="p-6 border-2 border-violet-100 dark:border-violet-900 bg-gradient-to-br from-violet-50 to-purple-50 dark:from-violet-950/20 dark:to-purple-950/20">
        <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">搜索新好友</h2>
        <UserSearchInput />
      </Card>

      {/* Friends List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
            {receivedRequests.length > 0 && (
              <span className="text-orange-600 dark:text-orange-400">
                {receivedRequests.length} 个待处理请求
              </span>
            )}
            {receivedRequests.length === 0 && totalCount > 0 && '我的联系人'}
            {totalCount === 0 && ''}
          </h2>
        </div>
        <UnifiedFriendsList
          friends={friends}
          receivedRequests={receivedRequests}
          sentRequests={sentRequests}
        />
      </div>
    </div>
  );
}
