'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { CheckIcon, XMarkIcon, UserMinusIcon, ClockIcon, PaperAirplaneIcon } from '@heroicons/react/24/outline';
import { acceptFriendRequestAction, rejectFriendRequestAction, deleteFriendAction } from '@/app/actions/friends';
import type { FriendWithUser } from '@/lib/types/doyouagree';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

interface UnifiedFriendsListProps {
  friends: FriendWithUser[];
  receivedRequests: FriendWithUser[];
  sentRequests: FriendWithUser[];
}

type FriendItem = FriendWithUser & {
  itemType: 'friend' | 'received' | 'sent';
};

export function UnifiedFriendsList({ friends, receivedRequests, sentRequests }: UnifiedFriendsListProps) {
  const t = useTranslations('friends');
  const router = useRouter();
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [deletingItem, setDeletingItem] = useState<FriendItem | null>(null);

  // Combine all items with type
  const allItems: FriendItem[] = [
    ...receivedRequests.map(r => ({ ...r, itemType: 'received' as const })),
    ...friends.map(f => ({ ...f, itemType: 'friend' as const })),
    ...sentRequests.map(s => ({ ...s, itemType: 'sent' as const })),
  ];

  const handleAccept = async (requestId: string) => {
    setProcessingId(requestId);
    const result = await acceptFriendRequestAction(requestId);
    setProcessingId(null);

    if (result.success) {
      toast.success('已接受好友请求');
      router.refresh();
    } else {
      toast.error(result.error || '操作失败');
    }
  };

  const handleReject = async (requestId: string) => {
    setProcessingId(requestId);
    const result = await rejectFriendRequestAction(requestId);
    setProcessingId(null);

    if (result.success) {
      toast.success('已拒绝好友请求');
      router.refresh();
    } else {
      toast.error(result.error || '操作失败');
    }
  };

  const handleDelete = async (friendId: string) => {
    setProcessingId(friendId);
    const result = await deleteFriendAction(friendId);
    setProcessingId(null);
    setDeletingItem(null);

    if (result.success) {
      toast.success('已删除好友');
      router.refresh();
    } else {
      toast.error(result.error || '删除失败');
    }
  };

  const getStatusBadge = (itemType: FriendItem['itemType']) => {
    switch (itemType) {
      case 'received':
        return (
          <Badge className="bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300 border-orange-200 dark:border-orange-800">
            <ClockIcon className="h-3 w-3 mr-1" />
            待处理
          </Badge>
        );
      case 'sent':
        return (
          <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300 border-blue-200 dark:border-blue-800">
            <PaperAirplaneIcon className="h-3 w-3 mr-1" />
            已发送
          </Badge>
        );
      case 'friend':
        return (
          <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300 border-green-200 dark:border-green-800">
            <CheckIcon className="h-3 w-3 mr-1" />
            好友
          </Badge>
        );
    }
  };

  const renderActions = (item: FriendItem) => {
    const isProcessing = processingId === item.id || processingId === item.friend.id;

    switch (item.itemType) {
      case 'received':
        return (
          <div className="flex gap-2">
            <Button
              size="sm"
              onClick={() => handleAccept(item.id)}
              disabled={isProcessing}
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              <CheckIcon className="h-4 w-4 mr-1" />
              接受
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleReject(item.id)}
              disabled={isProcessing}
              className="border-red-200 text-red-600 hover:bg-red-50 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-950"
            >
              <XMarkIcon className="h-4 w-4 mr-1" />
              拒绝
            </Button>
          </div>
        );
      case 'sent':
        return (
          <Badge variant="outline" className="text-slate-500 dark:text-slate-400">
            等待对方同意
          </Badge>
        );
      case 'friend':
        return (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setDeletingItem(item)}
            disabled={isProcessing}
            className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950"
          >
            <UserMinusIcon className="h-4 w-4" />
          </Button>
        );
    }
  };

  const getDisplayUser = (item: FriendItem) => {
    // For received requests: show the sender (user)
    // For friends and sent requests: show the other person (friend)
    return item.itemType === 'received' ? item.user : item.friend;
  };

  if (allItems.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-violet-100 dark:bg-violet-900 mb-4">
          <svg className="w-8 h-8 text-violet-600 dark:text-violet-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
        </div>
        <p className="text-lg font-medium text-slate-900 dark:text-white mb-1">{t('noFriends')}</p>
        <p className="text-sm text-slate-500 dark:text-slate-400">搜索用户并添加好友开始</p>
      </div>
    );
  }

  return (
    <>
      <div className="grid gap-3">
        {allItems.map((item) => {
          const displayUser = getDisplayUser(item);
          return (
            <Card key={`${item.itemType}-${item.id}`} className="overflow-hidden hover:shadow-md transition-all duration-200">
              <div className="p-4 flex items-center justify-between gap-4">
                {/* User Info */}
                <div className="flex items-center gap-4 flex-1 min-w-0">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center flex-shrink-0 shadow-md overflow-hidden">
                    {displayUser.avatar_url ? (
                      <img
                        src={displayUser.avatar_url}
                        alt={displayUser.full_name || 'User avatar'}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-lg font-semibold text-white">
                        {displayUser.full_name[0].toUpperCase()}
                      </span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-semibold text-slate-900 dark:text-white truncate">
                        {displayUser.full_name}
                      </p>
                      {getStatusBadge(item.itemType)}
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex-shrink-0">
                  {renderActions(item)}
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deletingItem} onOpenChange={(open) => !open && setDeletingItem(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>删除好友</AlertDialogTitle>
            <AlertDialogDescription>
              确定要删除好友 {deletingItem && getDisplayUser(deletingItem).full_name} 吗？
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>取消</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deletingItem && handleDelete(deletingItem.friend.id)}
              className="bg-red-600 hover:bg-red-700"
            >
              删除
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
