'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { UserMinusIcon } from '@heroicons/react/24/outline';
import { deleteFriendAction } from '@/app/actions/friends';
import type { FriendWithUser } from '@/lib/types/doyouagree';
import { toast } from 'sonner';

interface FriendsListProps {
  friends: FriendWithUser[];
  onFriendDeleted?: (friendId: string) => void;
}

export function FriendsList({ friends, onFriendDeleted }: FriendsListProps) {
  const t = useTranslations('friends');
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleDelete = async (friendId: string) => {
    setDeletingId(friendId);
    const result = await deleteFriendAction(friendId);
    setDeletingId(null);

    if (result.success) {
      toast.success('已删除好友');
      onFriendDeleted?.(friendId);
    } else {
      toast.error(result.error || '删除失败');
    }
  };

  if (friends.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-slate-500 dark:text-slate-400">
          {t('noFriends')}
        </p>
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2">
      {friends.map((friendship) => {
        const friend = friendship.friend;
        return (
          <Card key={friendship.id} className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-violet-100 dark:bg-violet-900 flex items-center justify-center">
                  <span className="text-lg font-medium text-violet-600 dark:text-violet-400">
                    {(friend.full_name || friend.email || '?')[0].toUpperCase()}
                  </span>
                </div>
                <div>
                  <p className="font-medium text-slate-900 dark:text-white">
                    {friend.full_name || friend.email}
                  </p>
                </div>
              </div>

              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    disabled={deletingId === friend.id}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950"
                  >
                    <UserMinusIcon className="h-4 w-4" />
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>删除好友</AlertDialogTitle>
                    <AlertDialogDescription>
                      确定要删除好友 {friend.full_name} 吗？
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>取消</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={() => handleDelete(friend.id)}
                      className="bg-red-600 hover:bg-red-700"
                    >
                      删除
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </Card>
        );
      })}
    </div>
  );
}
