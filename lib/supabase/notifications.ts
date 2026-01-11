import { createClient } from './server';
import type { Notification } from '../types/doyouagree';

/**
 * 获取当前用户的通知列表
 */
export async function getNotifications(params?: {
  unreadOnly?: boolean;
  limit?: number;
}): Promise<Notification[]> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return [];
  }

  let query = supabase
    .from('notifications')
    .select('*')
    .eq('user_id', user.id);

  if (params?.unreadOnly) {
    query = query.eq('read', false);
  }

  query = query.order('created_at', { ascending: false });

  if (params?.limit) {
    query = query.limit(params.limit);
  }

  const { data, error } = await query;

  if (error) {
    console.error('Error fetching notifications:', error);
    return [];
  }

  return data || [];
}

/**
 * 获取未读通知数量
 */
export async function getUnreadNotificationCount(): Promise<number> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return 0;
  }

  const { count, error } = await supabase
    .from('notifications')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user.id)
    .eq('read', false);

  if (error) {
    console.error('Error counting unread notifications:', error);
    return 0;
  }

  return count || 0;
}

/**
 * 标记通知为已读
 */
export async function markNotificationAsRead(notificationId: string): Promise<{ success: boolean }> {
  const supabase = await createClient();

  const { error } = await supabase
    .from('notifications')
    .update({ read: true })
    .eq('id', notificationId);

  if (error) {
    console.error('Error marking notification as read:', error);
    return { success: false };
  }

  return { success: true };
}

/**
 * 标记所有通知为已读
 */
export async function markAllNotificationsAsRead(): Promise<{ success: boolean }> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { success: false };
  }

  const { error } = await supabase
    .from('notifications')
    .update({ read: true })
    .eq('user_id', user.id)
    .eq('read', false);

  if (error) {
    console.error('Error marking all notifications as read:', error);
    return { success: false };
  }

  return { success: true };
}

/**
 * 删除通知
 */
export async function deleteNotification(notificationId: string): Promise<{ success: boolean }> {
  const supabase = await createClient();

  const { error } = await supabase
    .from('notifications')
    .delete()
    .eq('id', notificationId);

  if (error) {
    console.error('Error deleting notification:', error);
    return { success: false };
  }

  return { success: true };
}

/**
 * 创建通知（内部使用）
 */
export async function createNotification(params: {
  userId: string;
  type: 'friend_request' | 'new_question' | 'question_answered';
  title: string;
  content: string;
  link?: string;
}): Promise<{ success: boolean }> {
  const supabase = await createClient();

  const { error } = await supabase
    .from('notifications')
    .insert({
      user_id: params.userId,
      type: params.type,
      title: params.title,
      content: params.content,
      link: params.link || null,
      read: false,
    });

  if (error) {
    console.error('Error creating notification:', error);
    return { success: false };
  }

  return { success: true };
}
