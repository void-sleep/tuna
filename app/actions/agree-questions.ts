'use server';

import { createClient } from '@/lib/supabase/server';
import type { AgreeQuestionWithUsers } from '@/lib/types/doyouagree';
import { checkFriendship } from './friends-helpers';

export async function createAgreeQuestionAction(params: {
  applicationId: string;
  toUserId: string;
  questionText: string;
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
      question_text: params.questionText,
      options: params.options,
      status: 'pending',
    })
    .select()
    .single();

  if (error) {
    console.error('Error creating question:', error);
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
    console.error('Error answering question:', error);
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
