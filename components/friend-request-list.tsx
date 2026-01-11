'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { acceptFriendRequestAction, rejectFriendRequestAction } from '@/app/actions/friends';
import type { FriendWithUser } from '@/lib/types/doyouagree';
import { toast } from 'sonner';

interface FriendRequestListProps {
  requests: FriendWithUser[];
  type: 'received' | 'sent';
  onRequestHandled?: (requestId: string) => void;
}

export function FriendRequestList({ requests, type, onRequestHandled }: FriendRequestListProps) {
  const [processingId, setProcessingId] = useState<string | null>(null);

  const handleAccept = async (requestId: string) => {
    setProcessingId(requestId);
    const result = await acceptFriendRequestAction(requestId);
    setProcessingId(null);

    if (result.success) {
      toast.success('已接受好友请求');
      onRequestHandled?.(requestId);
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
      onRequestHandled?.(requestId);
    } else {
      toast.error(result.error || '操作失败');
    }
  };

  if (requests.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-slate-500 dark:text-slate-400">
          {type === 'received' ? '暂无待处理的好友请求' : '暂无已发送的好友请求'}
        </p>
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2">
      {requests.map((request) => {
        const displayUser = type === 'received' ? request.user : request.friend;
        return (
          <Card key={request.id} className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-violet-100 dark:bg-violet-900 flex items-center justify-center">
                  <span className="text-lg font-medium text-violet-600 dark:text-violet-400">
                    {displayUser.full_name[0].toUpperCase()}
                  </span>
                </div>
                <div>
                  <p className="font-medium text-slate-900 dark:text-white">
                    {displayUser.full_name}
                  </p>
                  {type === 'sent' && (
                    <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
                      等待对方同意
                    </p>
                  )}
                </div>
              </div>

              {type === 'received' && (
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleAccept(request.id)}
                    disabled={processingId === request.id}
                    className="text-green-600 hover:text-green-700 hover:bg-green-50 dark:hover:bg-green-950"
                  >
                    <CheckIcon className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleReject(request.id)}
                    disabled={processingId === request.id}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950"
                  >
                    <XMarkIcon className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </div>
          </Card>
        );
      })}
    </div>
  );
}
