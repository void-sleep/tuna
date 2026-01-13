'use server';

import { createClient } from '@/lib/supabase/server';

/**
 * Check if two users are friends (bilateral accepted status)
 * This helper exists to avoid circular dependencies between action files
 */
export async function checkFriendship(userId: string, friendId: string): Promise<boolean> {
  const supabase = await createClient();

  // Check if there's an accepted friendship record in either direction
  const { data, error } = await supabase
    .from('friends')
    .select('id')
    .or(`and(user_id.eq.${userId},friend_id.eq.${friendId}),and(user_id.eq.${friendId},friend_id.eq.${userId})`)
    .eq('status', 'accepted')
    .limit(1);

  if (error || !data || data.length === 0) {
    return false;
  }

  return true;
}
