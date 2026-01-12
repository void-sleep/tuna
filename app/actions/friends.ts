'use server';

import { createClient } from '@/lib/supabase/server';
import type { UserProfile, FriendWithUser } from '@/lib/types/doyouagree';

/**
 * Server Actions for friends management
 * These can be called from client components without import boundary issues
 */

/**
 * Helper function to get display name from profile
 * Returns full_name if available, otherwise email prefix (before @)
 */
function getDisplayName(email: string, full_name: string | null): string {
  if (full_name && full_name.trim()) {
    return full_name.trim();
  }
  // Use email prefix (before @) as fallback
  return email.split('@')[0];
}

export async function getFriendsAction(): Promise<FriendWithUser[]> {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const { data: friends, error } = await supabase
    .from('friends')
    .select('*')
    .eq('user_id', user.id)
    .eq('status', 'accepted')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching friends:', error);
    return [];
  }

  if (!friends || friends.length === 0) return [];

  // Get unique user IDs
  const userIds = new Set<string>();
  friends.forEach(f => {
    userIds.add(f.user_id);
    userIds.add(f.friend_id);
  });

  // Fetch profiles for these users
  const { data: profiles } = await supabase
    .from('profiles')
    .select('id, email, full_name, avatar_url')
    .in('id', Array.from(userIds));

  // Transform profiles to use display names
  const profileMap = new Map(
    profiles?.map(p => [
      p.id,
      {
        id: p.id,
        full_name: getDisplayName(p.email, p.full_name),
        avatar_url: p.avatar_url,
      } as UserProfile,
    ]) || []
  );

  // Combine data
  return friends.map(f => ({
    ...f,
    user: profileMap.get(f.user_id) || { id: f.user_id, full_name: 'Unknown', avatar_url: null },
    friend: profileMap.get(f.friend_id) || { id: f.friend_id, full_name: 'Unknown', avatar_url: null },
  }));
}

export async function getReceivedFriendRequestsAction(): Promise<FriendWithUser[]> {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const { data: requests, error } = await supabase
    .from('friends')
    .select('*')
    .eq('friend_id', user.id)
    .eq('status', 'pending')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching received requests:', error);
    return [];
  }

  if (!requests || requests.length === 0) return [];

  // Get unique user IDs
  const userIds = new Set<string>();
  requests.forEach(f => {
    userIds.add(f.user_id);
    userIds.add(f.friend_id);
  });

  // Fetch profiles for these users
  const { data: profiles } = await supabase
    .from('profiles')
    .select('id, email, full_name, avatar_url')
    .in('id', Array.from(userIds));

  // Transform profiles to use display names
  const profileMap = new Map(
    profiles?.map(p => [
      p.id,
      {
        id: p.id,
        full_name: getDisplayName(p.email, p.full_name),
        avatar_url: p.avatar_url,
      } as UserProfile,
    ]) || []
  );

  // Combine data
  return requests.map(f => ({
    ...f,
    user: profileMap.get(f.user_id) || { id: f.user_id, full_name: 'Unknown', avatar_url: null },
    friend: profileMap.get(f.friend_id) || { id: f.friend_id, full_name: 'Unknown', avatar_url: null },
  }));
}

export async function getSentFriendRequestsAction(): Promise<FriendWithUser[]> {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const { data: requests, error } = await supabase
    .from('friends')
    .select('*')
    .eq('user_id', user.id)
    .eq('status', 'pending')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching sent requests:', error);
    return [];
  }

  if (!requests || requests.length === 0) return [];

  // Get unique user IDs
  const userIds = new Set<string>();
  requests.forEach(f => {
    userIds.add(f.user_id);
    userIds.add(f.friend_id);
  });

  // Fetch profiles for these users
  const { data: profiles } = await supabase
    .from('profiles')
    .select('id, email, full_name, avatar_url')
    .in('id', Array.from(userIds));

  // Transform profiles to use display names
  const profileMap = new Map(
    profiles?.map(p => [
      p.id,
      {
        id: p.id,
        full_name: getDisplayName(p.email, p.full_name),
        avatar_url: p.avatar_url,
      } as UserProfile,
    ]) || []
  );

  // Combine data
  return requests.map(f => ({
    ...f,
    user: profileMap.get(f.user_id) || { id: f.user_id, full_name: 'Unknown', avatar_url: null },
    friend: profileMap.get(f.friend_id) || { id: f.friend_id, full_name: 'Unknown', avatar_url: null },
  }));
}

export async function sendFriendRequestAction(friendId: string): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return { success: false, error: '请先登录' };
  }

  if (user.id === friendId) {
    return { success: false, error: '不能添加自己为好友' };
  }

  // Check existing relationship
  const { data: existing } = await supabase
    .from('friends')
    .select('id, status')
    .eq('user_id', user.id)
    .eq('friend_id', friendId);

  if (existing && existing.length > 0) {
    const status = existing[0].status;
    if (status === 'pending') {
      return { success: false, error: '好友请求已发送' };
    } else if (status === 'accepted') {
      return { success: false, error: '已经是好友了' };
    } else if (status === 'rejected') {
      // Delete rejected request to allow retry
      await supabase.from('friends').delete().eq('id', existing[0].id);
    }
  }

  const { error } = await supabase.from('friends').insert({
    user_id: user.id,
    friend_id: friendId,
    status: 'pending',
  });

  if (error) {
    console.error('Error sending friend request:', error);
    return { success: false, error: '发送好友请求失败' };
  }

  return { success: true };
}

export async function acceptFriendRequestAction(requestId: string): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return { success: false, error: '请先登录' };
  }

  // Use RPC function for atomic transaction
  const { data, error } = await supabase.rpc('accept_friend_request_tx', {
    request_id: requestId,
  });

  if (error) {
    console.error('Error accepting friend request:', error);
    return { success: false, error: '接受好友请求失败' };
  }

  const result = data as { success: boolean; error?: string };
  return result;
}

export async function rejectFriendRequestAction(requestId: string): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return { success: false, error: '请先登录' };
  }

  const { error } = await supabase
    .from('friends')
    .update({ status: 'rejected' })
    .eq('id', requestId)
    .eq('friend_id', user.id);

  if (error) {
    console.error('Error rejecting friend request:', error);
    return { success: false, error: '拒绝好友请求失败' };
  }

  return { success: true };
}

export async function deleteFriendAction(friendId: string): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return { success: false, error: '请先登录' };
  }

  // Delete both directions of friendship
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

export async function searchUsersAction(query: string): Promise<UserProfile[]> {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const { data: profiles, error } = await supabase
    .from('profiles')
    .select('id, email, full_name, avatar_url')
    .or(`email.ilike.%${query}%,full_name.ilike.%${query}%`)
    .eq('searchable', true)
    .neq('id', user.id)
    .limit(10);

  if (error) {
    console.error('Error searching users:', error);
    return [];
  }

  // Filter out existing friends
  const { data: existingFriends } = await supabase
    .from('friends')
    .select('friend_id')
    .eq('user_id', user.id)
    .in('status', ['pending', 'accepted']);

  const friendIds = new Set(existingFriends?.map(f => f.friend_id) || []);

  // Transform profiles to use display names and filter out friends
  return (profiles || [])
    .filter(p => !friendIds.has(p.id))
    .map(p => ({
      id: p.id,
      full_name: getDisplayName(p.email, p.full_name),
      avatar_url: p.avatar_url,
    }));
}

export async function getCurrentUserProfileAction(): Promise<UserProfile | null> {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: profile, error } = await supabase
    .from('profiles')
    .select('id, email, full_name, avatar_url, searchable')
    .eq('id', user.id)
    .single();

  if (error) {
    console.error('Error fetching user profile:', error);
    return null;
  }

  return {
    id: profile.id,
    full_name: getDisplayName(profile.email, profile.full_name),
    avatar_url: profile.avatar_url,
    searchable: profile.searchable,
  };
}

export async function updateSearchableStatusAction(searchable: boolean): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return { success: false, error: 'Not authenticated' };
  }

  const { error } = await supabase
    .from('profiles')
    .update({ searchable })
    .eq('id', user.id);

  if (error) {
    console.error('Error updating searchable status:', error);
    return { success: false, error: error.message };
  }

  return { success: true };
}

export async function uploadAvatarAction(formData: FormData): Promise<{ success: boolean; error?: string; avatarUrl?: string }> {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return { success: false, error: '请先登录' };
  }

  const file = formData.get('avatar') as File;
  if (!file) {
    return { success: false, error: '请选择图片文件' };
  }

  // Validate file type
  if (!file.type.startsWith('image/')) {
    return { success: false, error: '只能上传图片文件' };
  }

  // Validate file size (max 2MB)
  if (file.size > 2 * 1024 * 1024) {
    return { success: false, error: '图片大小不能超过2MB' };
  }

  // Generate unique filename
  const fileExt = file.name.split('.').pop();
  const fileName = `${user.id}-${Date.now()}.${fileExt}`;
  const filePath = `avatars/${fileName}`;

  // Upload to Supabase Storage
  const { error: uploadError } = await supabase.storage
    .from('avatars')
    .upload(filePath, file, {
      cacheControl: '3600',
      upsert: false
    });

  if (uploadError) {
    console.error('Error uploading avatar:', uploadError);
    return { success: false, error: '上传失败，请重试' };
  }

  // Get public URL
  const { data: { publicUrl } } = supabase.storage
    .from('avatars')
    .getPublicUrl(filePath);

  // Update profile with new avatar URL
  const { error: updateError } = await supabase
    .from('profiles')
    .update({ avatar_url: publicUrl })
    .eq('id', user.id);

  if (updateError) {
    console.error('Error updating profile:', updateError);
    // Try to delete the uploaded file if profile update fails
    await supabase.storage.from('avatars').remove([filePath]);
    return { success: false, error: '更新头像失败' };
  }

  return { success: true, avatarUrl: publicUrl };
}
