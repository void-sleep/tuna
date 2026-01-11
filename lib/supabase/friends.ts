import { createClient } from './server';
import type { Friend, FriendWithUser, UserProfile } from '../types/doyouagree';

/**
 * 检查两个用户是否为好友（双向 accepted 状态）
 */
export async function checkFriendship(userId: string, friendId: string): Promise<boolean> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('friends')
    .select('id')
    .or(`and(user_id.eq.${userId},friend_id.eq.${friendId},status.eq.accepted),and(user_id.eq.${friendId},friend_id.eq.${userId},status.eq.accepted)`)
    .limit(2);

  if (error) {
    console.error('Error checking friendship:', error);
    return false;
  }

  // 需要双向都是 accepted
  return data.length === 2;
}

/**
 * 获取当前用户的所有好友（已接受）
 */
export async function getFriends(): Promise<FriendWithUser[]> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return [];
  }

  // 获取所有与当前用户相关的 accepted 好友关系
  const { data: friendships, error } = await supabase
    .from('friends')
    .select('*')
    .or(`user_id.eq.${user.id},friend_id.eq.${user.id}`)
    .eq('status', 'accepted')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching friends:', error);
    return [];
  }

  if (!friendships || friendships.length === 0) {
    return [];
  }

  // 提取所有相关用户 ID
  const userIds = new Set<string>();
  friendships.forEach((f: Friend) => {
    if (f.user_id !== user.id) userIds.add(f.user_id);
    if (f.friend_id !== user.id) userIds.add(f.friend_id);
  });

  // 获取用户信息
  const { data: profiles } = await supabase
    .from('profiles')
    .select('id, email, full_name, avatar_url')
    .in('id', Array.from(userIds));

  const userMap = new Map<string, UserProfile>();
  profiles?.forEach(p => {
    userMap.set(p.id, {
      id: p.id,
      email: p.email,
      full_name: p.full_name,
      avatar_url: p.avatar_url,
    });
  });

  // 组装结果（去重：只保留双向关系中的一条）
  const friendMap = new Map<string, FriendWithUser>();

  for (const friendship of friendships) {
    const otherUserId = friendship.user_id === user.id ? friendship.friend_id : friendship.user_id;
    const otherUser = userMap.get(otherUserId);

    if (!otherUser) continue;

    // 使用较小的 ID 作为 key 来去重
    const key = [user.id, otherUserId].sort().join('-');

    if (!friendMap.has(key)) {
      friendMap.set(key, {
        ...friendship,
        user: { id: user.id, email: user.email || '' },
        friend: otherUser,
      });
    }
  }

  return Array.from(friendMap.values());
}

/**
 * 获取收到的好友请求（pending）
 */
export async function getReceivedFriendRequests(): Promise<FriendWithUser[]> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return [];
  }

  const { data: requests, error } = await supabase
    .from('friends')
    .select('*')
    .eq('friend_id', user.id)
    .eq('status', 'pending')
    .order('created_at', { ascending: false });

  if (error || !requests) {
    console.error('Error fetching friend requests:', error);
    return [];
  }

  // 获取发送者信息
  const senderIds = requests.map(r => r.user_id);
  const { data: profiles } = await supabase
    .from('profiles')
    .select('id, email, full_name, avatar_url')
    .in('id', senderIds);

  const userMap = new Map<string, UserProfile>();
  profiles?.forEach(p => {
    userMap.set(p.id, {
      id: p.id,
      email: p.email,
      full_name: p.full_name,
      avatar_url: p.avatar_url,
    });
  });

  return requests.map(req => ({
    ...req,
    user: userMap.get(req.user_id)!,
    friend: { id: user.id, email: user.email || '' },
  })).filter(req => req.user);
}

/**
 * 获取发出的好友请求（pending）
 */
export async function getSentFriendRequests(): Promise<FriendWithUser[]> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return [];
  }

  const { data: requests, error } = await supabase
    .from('friends')
    .select('*')
    .eq('user_id', user.id)
    .eq('status', 'pending')
    .order('created_at', { ascending: false });

  if (error || !requests) {
    console.error('Error fetching sent requests:', error);
    return [];
  }

  // 获取接收者信息
  const receiverIds = requests.map(r => r.friend_id);
  const { data: profiles } = await supabase
    .from('profiles')
    .select('id, email, full_name, avatar_url')
    .in('id', receiverIds);

  const userMap = new Map<string, UserProfile>();
  profiles?.forEach(p => {
    userMap.set(p.id, {
      id: p.id,
      email: p.email,
      full_name: p.full_name,
      avatar_url: p.avatar_url,
    });
  });

  return requests.map(req => ({
    ...req,
    user: { id: user.id, email: user.email || '' },
    friend: userMap.get(req.friend_id)!,
  })).filter(req => req.friend);
}

/**
 * 发送好友请求
 */
export async function sendFriendRequest(friendId: string): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: '未登录' };
  }

  if (user.id === friendId) {
    return { success: false, error: '不能添加自己为好友' };
  }

  // 检查是否已存在关系
  const { data: existing } = await supabase
    .from('friends')
    .select('id, status')
    .or(`and(user_id.eq.${user.id},friend_id.eq.${friendId}),and(user_id.eq.${friendId},friend_id.eq.${user.id})`)
    .limit(1);

  if (existing && existing.length > 0) {
    const status = existing[0].status;
    if (status === 'pending') {
      return { success: false, error: '已发送过好友请求' };
    } else if (status === 'accepted') {
      return { success: false, error: '已经是好友了' };
    } else if (status === 'rejected') {
      // Delete old rejected record to allow retry
      await supabase.from('friends').delete().eq('id', existing[0].id);
    }
  }

  const { error } = await supabase
    .from('friends')
    .insert({
      user_id: user.id,
      friend_id: friendId,
      status: 'pending',
    });

  if (error) {
    console.error('Error sending friend request:', error);
    return { success: false, error: '发送好友请求失败' };
  }

  // TODO: 创建通知

  return { success: true };
}

/**
 * 接受好友请求
 */
export async function acceptFriendRequest(requestId: string): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient();

  const { data, error } = await supabase.rpc('accept_friend_request_tx', {
    request_id: requestId
  });

  if (error || !data) {
    console.error('Error accepting friend request:', error);
    return { success: false, error: '接受好友请求失败' };
  }

  if (data.success) {
    // TODO: 创建通知
    return { success: true };
  }

  return { success: false, error: data.error || '接受好友请求失败' };
}

/**
 * 拒绝好友请求
 */
export async function rejectFriendRequest(requestId: string): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient();

  const { error } = await supabase
    .from('friends')
    .update({ status: 'rejected' })
    .eq('id', requestId)
    .eq('status', 'pending');

  if (error) {
    console.error('Error rejecting friend request:', error);
    return { success: false, error: '拒绝好友请求失败' };
  }

  return { success: true };
}

/**
 * 删除好友关系
 */
export async function deleteFriend(friendId: string): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: '未登录' };
  }

  // 删除双向关系
  const { error } = await supabase
    .from('friends')
    .delete()
    .or(`and(user_id.eq.${user.id},friend_id.eq.${friendId}),and(user_id.eq.${friendId},friend_id.eq.${user.id})`);

  if (error) {
    console.error('Error deleting friend:', error);
    return { success: false, error: '删除好友失败' };
  }

  return { success: true };
}

/**
 * 搜索用户（按邮箱或名字）
 */
export async function searchUsers(query: string): Promise<UserProfile[]> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user || !query) {
    return [];
  }

  const lowerQuery = `%${query}%`;

  // 使用 profiles 表搜索用户
  const { data: profiles } = await supabase
    .from('profiles')
    .select('id, email, full_name, avatar_url')
    .neq('id', user.id) // 排除自己
    .or(`email.ilike.${lowerQuery},full_name.ilike.${lowerQuery}`)
    .limit(10);

  if (!profiles) {
    return [];
  }

  return profiles;
}
