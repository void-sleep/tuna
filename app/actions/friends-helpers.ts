'use server';

import { createClient } from '@/lib/supabase/server';

/**
 * Check if two users are friends (bilateral accepted status)
 * This helper exists to avoid circular dependencies between action files
 */
export async function checkFriendship(userId: string, friendId: string): Promise<boolean> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('friends')
    .select('id')
    .or(`and(user_id.eq.${userId},friend_id.eq.${friendId},status.eq.accepted),and(user_id.eq.${friendId},friend_id.eq.${userId},status.eq.accepted)`)
    .maybeSingle();

  if (error || !data) {
    return false;
  }

  // Check bilateral relationship
  const { data: reverse } = await supabase
    .from('friends')
    .select('id')
    .or(`and(user_id.eq.${friendId},friend_id.eq.${userId},status.eq.accepted),and(user_id.eq.${userId},friend_id.eq.${friendId},status.eq.accepted)`)
    .maybeSingle();

  return !!reverse;
}
