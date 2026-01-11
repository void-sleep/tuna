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

export async function getMyQuestionsAction(): Promise<{
  sent: AgreeQuestionWithUsers[];
  received: AgreeQuestionWithUsers[];
}> {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return { sent: [], received: [] };
  }

  // Get sent questions
  const { data: sent } = await supabase
    .from('agree_questions')
    .select(`
      *,
      from_user:from_user_id (id, email, full_name, avatar_url),
      to_user:to_user_id (id, email, full_name, avatar_url)
    `)
    .eq('from_user_id', user.id)
    .order('created_at', { ascending: false });

  // Get received questions
  const { data: received } = await supabase
    .from('agree_questions')
    .select(`
      *,
      from_user:from_user_id (id, email, full_name, avatar_url),
      to_user:to_user_id (id, email, full_name, avatar_url)
    `)
    .eq('to_user_id', user.id)
    .order('created_at', { ascending: false });

  return {
    sent: (sent || []) as AgreeQuestionWithUsers[],
    received: (received || []) as AgreeQuestionWithUsers[],
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
    .select(`
      *,
      from_user:from_user_id (id, email, full_name, avatar_url),
      to_user:to_user_id (id, email, full_name, avatar_url)
    `)
    .eq('id', questionId)
    .single();

  if (!question) {
    return { question: null, canView: false };
  }

  // Check if user can view (must be sender or receiver)
  const canView = question.from_user_id === user.id || question.to_user_id === user.id;

  return {
    question: canView ? (question as AgreeQuestionWithUsers) : null,
    canView,
  };
}
