'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card } from '@/components/ui/card';
import { UserSearchInput } from '@/components/user-search-input';
import { FriendsList } from '@/components/friends-list';
import { FriendRequestList } from '@/components/friend-request-list';
import type { FriendWithUser } from '@/lib/types/doyouagree';
import { UsersIcon } from '@heroicons/react/24/outline';

interface FriendsPageClientProps {
  friends: FriendWithUser[];
  receivedRequests: FriendWithUser[];
  sentRequests: FriendWithUser[];
}

export function FriendsPageClient({
  friends: initialFriends,
  receivedRequests: initialReceived,
  sentRequests: initialSent,
}: FriendsPageClientProps) {
  const t = useTranslations('friends');
  const [friends, setFriends] = useState(initialFriends);
  const [receivedRequests, setReceivedRequests] = useState(initialReceived);
  const [sentRequests, setSentRequests] = useState(initialSent);

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-slate-50/50 dark:bg-slate-950">
      <div className="max-w-5xl mx-auto px-4 md:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-violet-600 flex items-center justify-center">
              <UsersIcon className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
                {t('title')}
              </h1>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                {friends.length} {t('myFriends')}
              </p>
            </div>
          </div>
        </div>

        {/* Search */}
        <Card className="p-4 mb-6">
          <UserSearchInput
            onRequestSent={() => {
              // Refresh sent requests
              window.location.reload();
            }}
          />
        </Card>

        {/* Tabs */}
        <Tabs defaultValue="friends" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="friends">
              {t('myFriends')} ({friends.length})
            </TabsTrigger>
            <TabsTrigger value="received">
              {t('received')} ({receivedRequests.length})
            </TabsTrigger>
            <TabsTrigger value="sent">
              {t('sent')} ({sentRequests.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="friends" className="mt-6">
            <FriendsList
              friends={friends}
              onFriendDeleted={(friendId) => {
                setFriends(friends.filter(f => f.friend.id !== friendId));
              }}
            />
          </TabsContent>

          <TabsContent value="received" className="mt-6">
            <FriendRequestList
              requests={receivedRequests}
              type="received"
              onRequestHandled={(requestId) => {
                setReceivedRequests(receivedRequests.filter(r => r.id !== requestId));
                // Refresh friends list
                window.location.reload();
              }}
            />
          </TabsContent>

          <TabsContent value="sent" className="mt-6">
            <FriendRequestList
              requests={sentRequests}
              type="sent"
              onRequestHandled={(requestId) => {
                setSentRequests(sentRequests.filter(r => r.id !== requestId));
              }}
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
