'use server';

import { createClient } from '@/lib/supabase/server';
import type { AgreeQuestionWithUsers } from '@/lib/types/doyouagree';
import { checkFriendship } from './friends-helpers';

export async function createAgreeQuestionAction(params: {
  applicationId: string;
  toUserId: string;
  questionText?: string;
  options: string[];
}): Promise<{ success: boolean; error?: string; questionId?: string }> {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return { success: false, error: '请先登录' };
  }

  // Verify friendship
  const isFriend = await checkFriendship(user.id, params.toUserId);
  if (!isFriend) {
    return { success: false, error: '只能向好友提问' };
  }

  // Verify options
  if (params.options.length < 2) {
    return { success: false, error: '至少需要2个选项' };
  }

  const { data: question, error } = await supabase
    .from('agree_questions')
    .insert({
      application_id: params.applicationId,
      from_user_id: user.id,
      to_user_id: params.toUserId,
      question_text: params.questionText || null,
      options: params.options,
      status: 'pending',
    })
    .select()
    .single();

  if (error) {
    return { success: false, error: '创建问题失败' };
  }

  return { success: true, questionId: question.id };
}

export async function answerQuestionAction(params: {
  questionId: string;
  answer: string;
}): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return { success: false, error: '请先登录' };
  }

  // Verify question ownership and status
  const { data: question } = await supabase
    .from('agree_questions')
    .select('id, to_user_id, status, answer')
    .eq('id', params.questionId)
    .single();

  if (!question) {
    return { success: false, error: '问题不存在' };
  }

  if (question.to_user_id !== user.id) {
    return { success: false, error: '无权回答此问题' };
  }

  if (question.status !== 'pending') {
    return { success: false, error: '问题已回答或已过期' };
  }

  if (question.answer) {
    return { success: false, error: '问题已回答，无法修改' };
  }

  // Update question
  const { error } = await supabase
    .from('agree_questions')
    .update({
      answer: params.answer,
      status: 'answered',
      answered_at: new Date().toISOString(),
    })
    .eq('id', params.questionId);

  if (error) {
    return { success: false, error: '回答问题失败' };
  }

  return { success: true };
}

export async function getMyQuestionsAction(applicationId?: string): Promise<{
  sent: AgreeQuestionWithUsers[];
  received: AgreeQuestionWithUsers[];
}> {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return { sent: [], received: [] };
  }

  // Build query for sent questions
  let sentQuery = supabase
    .from('agree_questions')
    .select('*')
    .eq('from_user_id', user.id);

  if (applicationId) {
    sentQuery = sentQuery.eq('application_id', applicationId);
  }

  const { data: sent } = await sentQuery.order('created_at', { ascending: false });

  // Build query for received questions
  let receivedQuery = supabase
    .from('agree_questions')
    .select('*')
    .eq('to_user_id', user.id);

  if (applicationId) {
    receivedQuery = receivedQuery.eq('application_id', applicationId);
  }

  const { data: received } = await receivedQuery.order('created_at', { ascending: false });

  // Get all unique user IDs
  const userIds = new Set<string>();
  [...(sent || []), ...(received || [])].forEach(q => {
    userIds.add(q.from_user_id);
    userIds.add(q.to_user_id);
  });

  // Fetch profiles
  const { data: profiles } = await supabase
    .from('profiles')
    .select('id, email, full_name, avatar_url')
    .in('id', Array.from(userIds));

  const profileMap = new Map(profiles?.map(p => [p.id, p]) || []);

  // Helper to attach user profiles
  const attachProfiles = <T extends { from_user_id: string; to_user_id: string }>(questions: T[]) =>
    questions.map(q => ({
      ...q,
      from_user: profileMap.get(q.from_user_id) || { id: q.from_user_id, email: '', full_name: null, avatar_url: null },
      to_user: profileMap.get(q.to_user_id) || { id: q.to_user_id, email: '', full_name: null, avatar_url: null },
    }));

  return {
    sent: attachProfiles(sent || []),
    received: attachProfiles(received || []),
  };
}

/**
 * 获取当前用户的所有未答问题（用于浮动气泡和侧边栏）
 */
export async function getPendingQuestionsAction(): Promise<{
  questions: AgreeQuestionWithUsers[];
  count: number;
}> {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return { questions: [], count: 0 };
  }

  const { data: questions } = await supabase
    .from('agree_questions')
    .select('*')
    .eq('to_user_id', user.id)
    .eq('status', 'pending')
    .order('created_at', { ascending: false });

  if (!questions || questions.length === 0) {
    return { questions: [], count: 0 };
  }

  // Fetch profiles for all from_users
  const fromUserIds = [...new Set(questions.map(q => q.from_user_id))];
  const { data: profiles } = await supabase
    .from('profiles')
    .select('id, email, full_name, avatar_url')
    .in('id', fromUserIds);

  const profileMap = new Map(profiles?.map(p => [p.id, p]) || []);
  const currentUserProfile = { id: user.id, email: user.email || '', full_name: null, avatar_url: null };

  const questionsWithUsers = questions.map(q => ({
    ...q,
    from_user: profileMap.get(q.from_user_id) || { id: q.from_user_id, email: '', full_name: null, avatar_url: null },
    to_user: currentUserProfile,
  }));

  return {
    questions: questionsWithUsers as AgreeQuestionWithUsers[],
    count: questions.length,
  };
}

/**
 * 获取与某位好友的所有问答历史（用于时间线页面）
 */
export async function getFriendTimelineAction(friendId: string): Promise<{
  questions: AgreeQuestionWithUsers[];
  friend: { id: string; email: string; full_name: string | null; avatar_url: string | null } | null;
  totalCount: number;
}> {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return { questions: [], friend: null, totalCount: 0 };
  }

  // Get friend profile
  const { data: friendProfile } = await supabase
    .from('profiles')
    .select('id, email, full_name, avatar_url')
    .eq('id', friendId)
    .single();

  if (!friendProfile) {
    return { questions: [], friend: null, totalCount: 0 };
  }

  // Get all questions between current user and friend (both directions)
  const { data: questions } = await supabase
    .from('agree_questions')
    .select('*')
    .or(`and(from_user_id.eq.${user.id},to_user_id.eq.${friendId}),and(from_user_id.eq.${friendId},to_user_id.eq.${user.id})`)
    .order('created_at', { ascending: false });

  if (!questions) {
    return { questions: [], friend: friendProfile, totalCount: 0 };
  }

  // Get current user profile
  const { data: currentUserProfile } = await supabase
    .from('profiles')
    .select('id, email, full_name, avatar_url')
    .eq('id', user.id)
    .single();

  const myProfile = currentUserProfile || { id: user.id, email: user.email || '', full_name: null, avatar_url: null };

  const questionsWithUsers = questions.map(q => ({
    ...q,
    from_user: q.from_user_id === user.id ? myProfile : friendProfile,
    to_user: q.to_user_id === user.id ? myProfile : friendProfile,
  }));

  return {
    questions: questionsWithUsers as AgreeQuestionWithUsers[],
    friend: friendProfile,
    totalCount: questions.length,
  };
}

/**
 * 获取好友互动统计（用于好友列表显示）
 */
export async function getFriendInteractionStatsAction(): Promise<{
  stats: Map<string, { pendingCount: number; lastInteraction: string | null }>;
}> {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return { stats: new Map() };
  }

  // Get pending questions count per friend (questions TO me)
  const { data: pendingQuestions } = await supabase
    .from('agree_questions')
    .select('from_user_id')
    .eq('to_user_id', user.id)
    .eq('status', 'pending');

  // Get all questions involving current user to find last interaction
  const { data: allQuestions } = await supabase
    .from('agree_questions')
    .select('from_user_id, to_user_id, created_at, answered_at')
    .or(`from_user_id.eq.${user.id},to_user_id.eq.${user.id}`)
    .order('created_at', { ascending: false });

  const statsMap = new Map<string, { pendingCount: number; lastInteraction: string | null }>();

  // Count pending questions per friend
  pendingQuestions?.forEach(q => {
    const existing = statsMap.get(q.from_user_id) || { pendingCount: 0, lastInteraction: null };
    existing.pendingCount++;
    statsMap.set(q.from_user_id, existing);
  });

  // Find last interaction per friend
  allQuestions?.forEach(q => {
    const friendId = q.from_user_id === user.id ? q.to_user_id : q.from_user_id;
    const existing = statsMap.get(friendId) || { pendingCount: 0, lastInteraction: null };

    if (!existing.lastInteraction) {
      existing.lastInteraction = q.answered_at || q.created_at;
      statsMap.set(friendId, existing);
    }
  });

  return { stats: statsMap };
}

/**
 * 获取好友互动统计（返回普通对象，便于序列化）
 */
export async function getFriendInteractionStatsObjectAction(): Promise<
  Record<string, { pendingCount: number; lastInteraction: string | null }>
> {
  const { stats } = await getFriendInteractionStatsAction();
  return Object.fromEntries(stats);
}

export async function getQuestionDetailAction(
  questionId: string
): Promise<{ question: AgreeQuestionWithUsers | null; canView: boolean }> {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return { question: null, canView: false };
  }

  const { data: question } = await supabase
    .from('agree_questions')
    .select('*')
    .eq('id', questionId)
    .single();

  if (!question) {
    return { question: null, canView: false };
  }

  // Check if user can view (must be sender or receiver)
  const canView = question.from_user_id === user.id || question.to_user_id === user.id;

  if (!canView) {
    return { question: null, canView: false };
  }

  // Fetch user profiles
  const { data: profiles } = await supabase
    .from('profiles')
    .select('id, email, full_name, avatar_url')
    .in('id', [question.from_user_id, question.to_user_id]);

  const profileMap = new Map(profiles?.map(p => [p.id, p]) || []);

  const questionWithUsers = {
    ...question,
    from_user: profileMap.get(question.from_user_id) || { id: question.from_user_id, email: '', full_name: null, avatar_url: null },
    to_user: profileMap.get(question.to_user_id) || { id: question.to_user_id, email: '', full_name: null, avatar_url: null },
  };

  return {
    question: questionWithUsers as AgreeQuestionWithUsers,
    canView: true,
  };
}
