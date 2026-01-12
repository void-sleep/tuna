'use client';

import { useTranslations } from 'next-intl';
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
  SparklesIcon
} from '@heroicons/react/24/outline';

interface FriendsPageRedesignedProps {
  friends: FriendWithUser[];
  receivedRequests: FriendWithUser[];
  sentRequests: FriendWithUser[];
}

export function FriendsPageRedesigned({ friends, receivedRequests, sentRequests }: FriendsPageRedesignedProps) {
  const t = useTranslations('friends');

  const totalCount = friends.length + receivedRequests.length + sentRequests.length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/30 dark:from-slate-950 dark:via-blue-950/10 dark:to-indigo-950/10">
      <div className="container max-w-6xl px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-6 sm:space-y-8">
        {/* Header with Stats */}
        <div className="relative px-2">
          <div className="absolute -top-4 -left-4 w-24 h-24 bg-gradient-to-br from-blue-500/20 to-indigo-500/20 rounded-full blur-3xl" />
          <div className="relative space-y-4">
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/25">
                <UserGroupIcon className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">
                  {t('title')}
                </h1>
                <p className="text-slate-600 dark:text-slate-400 mt-1">
                  {totalCount > 0 ? `共 ${totalCount} 个联系人` : '开始添加你的第一个好友'}
                </p>
              </div>
            </div>

            {/* Stats Cards */}
            {totalCount > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                {/* Friends Count */}
                <div className="p-4 rounded-2xl bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20 border-2 border-green-200 dark:border-green-900/30">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center shadow-lg shadow-green-500/25">
                      <UsersIcon className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-green-700 dark:text-green-400">{friends.length}</p>
                      <p className="text-xs text-green-600 dark:text-green-500">好友</p>
                    </div>
                  </div>
                </div>

                {/* Received Requests */}
                <div className="p-4 rounded-2xl bg-gradient-to-br from-orange-50 to-amber-50 dark:from-orange-950/20 dark:to-amber-950/20 border-2 border-orange-200 dark:border-orange-900/30">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-amber-600 flex items-center justify-center shadow-lg shadow-orange-500/25">
                      <BellAlertIcon className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-orange-700 dark:text-orange-400">{receivedRequests.length}</p>
                      <p className="text-xs text-orange-600 dark:text-orange-500">待处理</p>
                    </div>
                  </div>
                </div>

                {/* Sent Requests */}
                <div className="p-4 rounded-2xl bg-gradient-to-br from-blue-50 to-sky-50 dark:from-blue-950/20 dark:to-sky-950/20 border-2 border-blue-200 dark:border-blue-900/30">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-sky-600 flex items-center justify-center shadow-lg shadow-blue-500/25">
                      <PaperAirplaneIcon className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-blue-700 dark:text-blue-400">{sentRequests.length}</p>
                      <p className="text-xs text-blue-600 dark:text-blue-500">已发送</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Search Section */}
        <Card className="p-6 sm:p-8 border-2 border-indigo-100 dark:border-indigo-900/50 bg-gradient-to-br from-white via-indigo-50/30 to-purple-50/30 dark:from-slate-900 dark:via-indigo-950/20 dark:to-purple-950/20 shadow-xl shadow-indigo-500/5 relative overflow-hidden">
          {/* Background decoration */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-indigo-500/10 to-purple-500/10 rounded-full blur-3xl -z-10" />

          <div className="space-y-6">
            <div className="flex items-start gap-4">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center flex-shrink-0 shadow-lg shadow-indigo-500/25">
                <MagnifyingGlassIcon className="h-7 w-7 text-white" />
              </div>
              <div className="flex-1">
                <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-1">
                  搜索新好友
                </h2>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  通过名称或邮箱查找并添加好友
                </p>
              </div>
            </div>

            <div className="relative">
              <UserSearchInput />
            </div>

            {/* Search Tips */}
            <div className="p-4 rounded-xl bg-gradient-to-br from-violet-50 to-purple-50 dark:from-violet-950/20 dark:to-purple-950/20 border border-violet-200 dark:border-violet-900/30">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-violet-500 flex items-center justify-center flex-shrink-0">
                  <SparklesIcon className="h-4 w-4 text-white" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-violet-900 dark:text-violet-300 mb-1">
                    搜索提示
                  </p>
                  <p className="text-xs text-violet-700 dark:text-violet-400">
                    输入好友的完整名称或邮箱地址即可搜索。只有开启了可搜索设置的用户才会出现在搜索结果中。
                  </p>
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Friends List Section */}
        <div className="space-y-4 sm:space-y-6">
          {receivedRequests.length > 0 && (
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-orange-50 to-amber-50 dark:from-orange-950/20 dark:to-amber-950/20 border-2 border-orange-200 dark:border-orange-900/30">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-amber-600 flex items-center justify-center shadow-lg shadow-orange-500/25">
                <BellAlertIcon className="h-5 w-5 text-white animate-pulse" />
              </div>
              <div>
                <p className="font-semibold text-orange-900 dark:text-orange-300">
                  {receivedRequests.length} 个好友请求待处理
                </p>
                <p className="text-sm text-orange-700 dark:text-orange-400">
                  点击下方的「接受」或「拒绝」按钮处理请求
                </p>
              </div>
            </div>
          )}

          {totalCount > 0 ? (
            <Card className="p-5 sm:p-6 lg:p-8 border-2 border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xl shadow-slate-500/5">
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
