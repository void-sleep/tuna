import type { SupabaseClient, User } from '@supabase/supabase-js';
import { createClient } from '@supabase/supabase-js';

// 创建 Supabase 管理客户端实例
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

export interface FriendWithUser {
  id: string;
  friend_id: string;
  status: string;
  created_at: string;
  friend_email: string;
  friend_name: string | null;
}

export interface FriendRequestWithUser {
  id: string;
  user_id: string;
  friend_id: string;
  status: string;
  created_at: string;
  user_email: string;
  user_name: string | null;
}

export interface SearchedUser {
  id: string;
  email: string;
  name: string | null;
  is_friend: boolean;
  friend_request_status: 'none' | 'pending_sent' | 'pending_received' | 'accepted';
}

/**
 * 检查两个用户之间是否是好友关系
 * 必须双向都是 accepted 状态才算好友
 */
export async function checkFriendship(
  client: SupabaseClient,
  userId: string,
  friendId: string
): Promise<{ isFriend: boolean; error: string | null }> {
  try {
    // 检查 A -> B
    const { data: friendshipAB, error: errorAB } = await client
      .from('friends')
      .select('status')
      .eq('user_id', userId)
      .eq('friend_id', friendId)
      .eq('status', 'accepted')
      .maybeSingle();

    if (errorAB) {
      console.error('Error checking friendship A->B:', errorAB);
      return { isFriend: false, error: errorAB.message };
    }

    // 检查 B -> A
    const { data: friendshipBA, error: errorBA } = await client
      .from('friends')
      .select('status')
      .eq('user_id', friendId)
      .eq('friend_id', userId)
      .eq('status', 'accepted')
      .maybeSingle();

    if (errorBA) {
      console.error('Error checking friendship B->A:', errorBA);
      return { isFriend: false, error: errorBA.message };
    }

    // 双向都是 accepted 才算好友
    const isFriend = !!friendshipAB && !!friendshipBA;
    return { isFriend, error: null };
  } catch (err) {
    console.error('Unexpected error in checkFriendship:', err);
    return { isFriend: false, error: err instanceof Error ? err.message : 'Unknown error' };
  }
}

/**
 * 获取当前用户的好友列表（已接受的好友）
 * 包含好友的基本信息（email, name）
 */
export async function getFriends(
  client: SupabaseClient,
  userId: string
): Promise<{ friends: FriendWithUser[]; error: string | null }> {
  try {
    // 获取所有 accepted 的好友关系
    const { data: friendships, error: friendshipsError } = await client
      .from('friends')
      .select('*')
      .eq('user_id', userId)
      .eq('status', 'accepted')
      .order('created_at', { ascending: false });

    if (friendshipsError) {
      console.error('Error fetching friendships:', friendshipsError);
      return { friends: [], error: friendshipsError.message };
    }

    if (!friendships || friendships.length === 0) {
      return { friends: [], error: null };
    }

    // 获取所有好友的 user_id
    const friendIds = friendships.map((f) => f.friend_id);

    // 使用 Admin API 获取用户信息
    const { data: usersData, error: usersError } = await supabaseAdmin.auth.admin.listUsers();

    if (usersError) {
      console.error('Error fetching users:', usersError);
      return { friends: [], error: usersError.message };
    }

    // 创建用户信息映射
    const usersMap = new Map<string, User>();
    usersData.users.forEach((user) => {
      usersMap.set(user.id, user);
    });

    // 合并好友关系和用户信息
    const friendsWithUser: FriendWithUser[] = friendships
      .map((friendship) => {
        const friendUser = usersMap.get(friendship.friend_id);
        if (!friendUser) return null;

        return {
          id: friendship.id,
          friend_id: friendship.friend_id,
          status: friendship.status,
          created_at: friendship.created_at,
          friend_email: friendUser.email || '',
          friend_name: friendUser.user_metadata?.name || null,
        };
      })
      .filter((f): f is FriendWithUser => f !== null);

    // 去重：因为双向关系，可能会有重复的好友
    const uniqueFriends = Array.from(
      new Map(friendsWithUser.map((f) => [f.friend_id, f])).values()
    );

    return { friends: uniqueFriends, error: null };
  } catch (err) {
    console.error('Unexpected error in getFriends:', err);
    return { friends: [], error: err instanceof Error ? err.message : 'Unknown error' };
  }
}

/**
 * 获取收到的好友请求（pending 状态）
 * 包含发送者的基本信息（email, name）
 */
export async function getReceivedFriendRequests(
  client: SupabaseClient,
  userId: string
): Promise<{ requests: FriendRequestWithUser[]; error: string | null }> {
  try {
    // 获取所有发给当前用户的 pending 请求
    const { data: requests, error: requestsError } = await client
      .from('friends')
      .select('*')
      .eq('friend_id', userId)
      .eq('status', 'pending')
      .order('created_at', { ascending: false });

    if (requestsError) {
      console.error('Error fetching received requests:', requestsError);
      return { requests: [], error: requestsError.message };
    }

    if (!requests || requests.length === 0) {
      return { requests: [], error: null };
    }

    // 获取所有发送者的 user_id
    const senderIds = requests.map((r) => r.user_id);

    // 使用 Admin API 获取用户信息
    const { data: usersData, error: usersError } = await supabaseAdmin.auth.admin.listUsers();

    if (usersError) {
      console.error('Error fetching users:', usersError);
      return { requests: [], error: usersError.message };
    }

    // 创建用户信息映射
    const usersMap = new Map<string, User>();
    usersData.users.forEach((user) => {
      usersMap.set(user.id, user);
    });

    // 合并请求和用户信息
    const requestsWithUser: FriendRequestWithUser[] = requests
      .map((request) => {
        const senderUser = usersMap.get(request.user_id);
        if (!senderUser) return null;

        return {
          id: request.id,
          user_id: request.user_id,
          friend_id: request.friend_id,
          status: request.status,
          created_at: request.created_at,
          user_email: senderUser.email || '',
          user_name: senderUser.user_metadata?.name || null,
        };
      })
      .filter((r): r is FriendRequestWithUser => r !== null);

    return { requests: requestsWithUser, error: null };
  } catch (err) {
    console.error('Unexpected error in getReceivedFriendRequests:', err);
    return { requests: [], error: err instanceof Error ? err.message : 'Unknown error' };
  }
}

/**
 * 获取发送的好友请求（pending 状态）
 * 包含接收者的基本信息（email, name）
 */
export async function getSentFriendRequests(
  client: SupabaseClient,
  userId: string
): Promise<{ requests: FriendRequestWithUser[]; error: string | null }> {
  try {
    // 获取当前用户发送的所有 pending 请求
    const { data: requests, error: requestsError } = await client
      .from('friends')
      .select('*')
      .eq('user_id', userId)
      .eq('status', 'pending')
      .order('created_at', { ascending: false });

    if (requestsError) {
      console.error('Error fetching sent requests:', requestsError);
      return { requests: [], error: requestsError.message };
    }

    if (!requests || requests.length === 0) {
      return { requests: [], error: null };
    }

    // 获取所有接收者的 user_id
    const receiverIds = requests.map((r) => r.friend_id);

    // 使用 Admin API 获取用户信息
    const { data: usersData, error: usersError } = await supabaseAdmin.auth.admin.listUsers();

    if (usersError) {
      console.error('Error fetching users:', usersError);
      return { requests: [], error: usersError.message };
    }

    // 创建用户信息映射
    const usersMap = new Map<string, User>();
    usersData.users.forEach((user) => {
      usersMap.set(user.id, user);
    });

    // 合并请求和用户信息
    const requestsWithUser: FriendRequestWithUser[] = requests
      .map((request) => {
        const receiverUser = usersMap.get(request.friend_id);
        if (!receiverUser) return null;

        return {
          id: request.id,
          user_id: request.user_id,
          friend_id: request.friend_id,
          status: request.status,
          created_at: request.created_at,
          user_email: receiverUser.email || '',
          user_name: receiverUser.user_metadata?.name || null,
        };
      })
      .filter((r): r is FriendRequestWithUser => r !== null);

    return { requests: requestsWithUser, error: null };
  } catch (err) {
    console.error('Unexpected error in getSentFriendRequests:', err);
    return { requests: [], error: err instanceof Error ? err.message : 'Unknown error' };
  }
}

/**
 * 发送好友请求
 * 检查是否已经存在请求，避免重复发送
 */
export async function sendFriendRequest(
  client: SupabaseClient,
  userId: string,
  friendId: string
): Promise<{ success: boolean; error: string | null; requestId?: string }> {
  try {
    // 不能给自己发送好友请求
    if (userId === friendId) {
      return { success: false, error: 'Cannot send friend request to yourself' };
    }

    // 检查是否已经存在请求（任何状态）
    const { data: existing, error: existingError } = await client
      .from('friends')
      .select('id, status')
      .eq('user_id', userId)
      .eq('friend_id', friendId)
      .maybeSingle();

    if (existingError) {
      console.error('Error checking existing request:', existingError);
      return { success: false, error: existingError.message };
    }

    if (existing) {
      if (existing.status === 'pending') {
        return { success: false, error: 'Friend request already sent' };
      } else if (existing.status === 'accepted') {
        return { success: false, error: 'Already friends' };
      }
      // 如果是 rejected，可以重新发送，需要先删除旧记录
      const { error: deleteError } = await client
        .from('friends')
        .delete()
        .eq('id', existing.id);

      if (deleteError) {
        console.error('Error deleting old request:', deleteError);
        return { success: false, error: deleteError.message };
      }
    }

    // 创建新的好友请求
    const { data: newRequest, error: insertError } = await client
      .from('friends')
      .insert({
        user_id: userId,
        friend_id: friendId,
        status: 'pending',
      })
      .select()
      .single();

    if (insertError) {
      console.error('Error creating friend request:', insertError);
      return { success: false, error: insertError.message };
    }

    // TODO: 在 Phase 4 实现通知功能时，发送通知给 friendId

    return { success: true, error: null, requestId: newRequest.id };
  } catch (err) {
    console.error('Unexpected error in sendFriendRequest:', err);
    return { success: false, error: err instanceof Error ? err.message : 'Unknown error' };
  }
}

/**
 * 接受好友请求
 * 将状态改为 accepted，并创建反向关系
 */
export async function acceptFriendRequest(
  client: SupabaseClient,
  userId: string,
  requestId: string
): Promise<{ success: boolean; error: string | null }> {
  try {
    // 获取请求详情，确保是发给当前用户的
    const { data: request, error: fetchError } = await client
      .from('friends')
      .select('*')
      .eq('id', requestId)
      .eq('friend_id', userId)
      .eq('status', 'pending')
      .single();

    if (fetchError) {
      console.error('Error fetching friend request:', fetchError);
      return { success: false, error: fetchError.message };
    }

    if (!request) {
      return { success: false, error: 'Friend request not found or already processed' };
    }

    // 更新请求状态为 accepted
    const { error: updateError } = await client
      .from('friends')
      .update({ status: 'accepted' })
      .eq('id', requestId);

    if (updateError) {
      console.error('Error accepting friend request:', updateError);
      return { success: false, error: updateError.message };
    }

    // 创建反向关系（B -> A）
    const { error: reverseError } = await client.from('friends').insert({
      user_id: userId,
      friend_id: request.user_id,
      status: 'accepted',
    });

    if (reverseError) {
      console.error('Error creating reverse friendship:', reverseError);
      // 尝试回滚第一个更新
      await client.from('friends').update({ status: 'pending' }).eq('id', requestId);
      return { success: false, error: reverseError.message };
    }

    // TODO: 在 Phase 4 实现通知功能时，发送通知给 request.user_id

    return { success: true, error: null };
  } catch (err) {
    console.error('Unexpected error in acceptFriendRequest:', err);
    return { success: false, error: err instanceof Error ? err.message : 'Unknown error' };
  }
}

/**
 * 拒绝好友请求
 * 将状态改为 rejected
 */
export async function rejectFriendRequest(
  client: SupabaseClient,
  userId: string,
  requestId: string
): Promise<{ success: boolean; error: string | null }> {
  try {
    // 确保是发给当前用户的请求
    const { data: request, error: fetchError } = await client
      .from('friends')
      .select('*')
      .eq('id', requestId)
      .eq('friend_id', userId)
      .eq('status', 'pending')
      .single();

    if (fetchError) {
      console.error('Error fetching friend request:', fetchError);
      return { success: false, error: fetchError.message };
    }

    if (!request) {
      return { success: false, error: 'Friend request not found or already processed' };
    }

    // 更新状态为 rejected
    const { error: updateError } = await client
      .from('friends')
      .update({ status: 'rejected' })
      .eq('id', requestId);

    if (updateError) {
      console.error('Error rejecting friend request:', updateError);
      return { success: false, error: updateError.message };
    }

    return { success: true, error: null };
  } catch (err) {
    console.error('Unexpected error in rejectFriendRequest:', err);
    return { success: false, error: err instanceof Error ? err.message : 'Unknown error' };
  }
}

/**
 * 删除好友关系
 * 删除双向关系
 */
export async function deleteFriend(
  client: SupabaseClient,
  userId: string,
  friendId: string
): Promise<{ success: boolean; error: string | null }> {
  try {
    // 删除 A -> B
    const { error: deleteABError } = await client
      .from('friends')
      .delete()
      .eq('user_id', userId)
      .eq('friend_id', friendId);

    if (deleteABError) {
      console.error('Error deleting friendship A->B:', deleteABError);
      return { success: false, error: deleteABError.message };
    }

    // 删除 B -> A
    const { error: deleteBAError } = await client
      .from('friends')
      .delete()
      .eq('user_id', friendId)
      .eq('friend_id', userId);

    if (deleteBAError) {
      console.error('Error deleting friendship B->A:', deleteBAError);
      return { success: false, error: deleteBAError.message };
    }

    return { success: true, error: null };
  } catch (err) {
    console.error('Unexpected error in deleteFriend:', err);
    return { success: false, error: err instanceof Error ? err.message : 'Unknown error' };
  }
}

/**
 * 搜索用户（通过 email 或 name）
 * 返回用户信息以及与当前用户的好友关系状态
 */
export async function searchUsers(
  client: SupabaseClient,
  userId: string,
  searchQuery: string
): Promise<{ users: SearchedUser[]; error: string | null }> {
  try {
    if (!searchQuery.trim()) {
      return { users: [], error: null };
    }

    // 使用 Admin API 获取所有用户
    const { data: usersData, error: usersError } = await supabaseAdmin.auth.admin.listUsers();

    if (usersError) {
      console.error('Error fetching users:', usersError);
      return { users: [], error: usersError.message };
    }

    // 过滤匹配的用户（email 或 name）
    const searchLower = searchQuery.toLowerCase();
    const matchedUsers = usersData.users.filter((user) => {
      const email = user.email?.toLowerCase() || '';
      const name = user.user_metadata?.name?.toLowerCase() || '';
      return (
        user.id !== userId && // 排除当前用户
        (email.includes(searchLower) || name.includes(searchLower))
      );
    });

    if (matchedUsers.length === 0) {
      return { users: [], error: null };
    }

    // 获取当前用户与这些用户的好友关系
    const matchedUserIds = matchedUsers.map((u) => u.id);

    const { data: friendships, error: friendshipsError } = await client
      .from('friends')
      .select('friend_id, status')
      .eq('user_id', userId)
      .in('friend_id', matchedUserIds);

    if (friendshipsError) {
      console.error('Error fetching friendships:', friendshipsError);
      return { users: [], error: friendshipsError.message };
    }

    // 创建好友状态映射
    const friendshipMap = new Map<
      string,
      'none' | 'pending_sent' | 'pending_received' | 'accepted'
    >();
    friendships?.forEach((f) => {
      if (f.status === 'pending') {
        friendshipMap.set(f.friend_id, 'pending_sent');
      } else if (f.status === 'accepted') {
        friendshipMap.set(f.friend_id, 'accepted');
      }
    });

    // 检查反向的 pending 请求（收到的请求）
    const { data: receivedRequests, error: receivedError } = await client
      .from('friends')
      .select('user_id, status')
      .eq('friend_id', userId)
      .in('user_id', matchedUserIds)
      .eq('status', 'pending');

    if (receivedError) {
      console.error('Error fetching received requests:', receivedError);
    } else {
      receivedRequests?.forEach((r) => {
        // 如果还没有状态，设置为 pending_received
        if (!friendshipMap.has(r.user_id)) {
          friendshipMap.set(r.user_id, 'pending_received');
        }
      });
    }

    // 合并用户信息和好友状态
    const searchedUsers: SearchedUser[] = matchedUsers.map((user) => {
      const status = friendshipMap.get(user.id) || 'none';
      return {
        id: user.id,
        email: user.email || '',
        name: user.user_metadata?.name || null,
        is_friend: status === 'accepted',
        friend_request_status: status,
      };
    });

    return { users: searchedUsers, error: null };
  } catch (err) {
    console.error('Unexpected error in searchUsers:', err);
    return { users: [], error: err instanceof Error ? err.message : 'Unknown error' };
  }
}
