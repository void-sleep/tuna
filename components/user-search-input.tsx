'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { MagnifyingGlassIcon, UserPlusIcon } from '@heroicons/react/24/outline';
import { searchUsersAction, sendFriendRequestAction } from '@/app/actions/friends';
import type { UserProfile } from '@/lib/types/doyouagree';
import { toast } from 'sonner';

interface UserSearchInputProps {
  onRequestSent?: () => void;
}

export function UserSearchInput({ onRequestSent }: UserSearchInputProps) {
  const t = useTranslations('friends');
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<UserProfile[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [sendingTo, setSendingTo] = useState<string | null>(null);

  const handleSearch = async () => {
    if (!query.trim()) {
      setResults([]);
      return;
    }

    setIsSearching(true);
    const users = await searchUsersAction(query);
    setResults(users);
    setIsSearching(false);
  };

  const handleSendRequest = async (userId: string) => {
    setSendingTo(userId);
    const result = await sendFriendRequestAction(userId);
    setSendingTo(null);

    if (result.success) {
      toast.success('好友请求已发送');
      setResults(results.filter(u => u.id !== userId));
      onRequestSent?.();
    } else {
      toast.error(result.error || '发送失败');
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <div className="relative flex-1">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            placeholder={t('search')}
            className="pl-10"
          />
        </div>
        <Button
          onClick={handleSearch}
          disabled={isSearching || !query.trim()}
        >
          {isSearching ? '搜索中...' : '搜索'}
        </Button>
      </div>

      {results.length > 0 && (
        <div className="space-y-2">
          {results.map((user) => (
            <Card key={user.id} className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-violet-100 dark:bg-violet-900 flex items-center justify-center">
                    <span className="text-sm font-medium text-violet-600 dark:text-violet-400">
                      {user.full_name[0].toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <p className="font-medium text-slate-900 dark:text-white">
                      {user.full_name}
                    </p>
                  </div>
                </div>
                <Button
                  size="sm"
                  onClick={() => handleSendRequest(user.id)}
                  disabled={sendingTo === user.id}
                  className="gap-2"
                >
                  <UserPlusIcon className="h-4 w-4" />
                  {sendingTo === user.id ? '发送中...' : t('addFriend')}
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {query && !isSearching && results.length === 0 && (
        <p className="text-center text-sm text-slate-500 dark:text-slate-400">
          未找到用户
        </p>
      )}
    </div>
  );
}
