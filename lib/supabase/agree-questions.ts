import { createClient } from './server';
import type { AgreeQuestion, AgreeQuestionWithUsers } from '../types/doyouagree';
import { checkFriendship } from './friends';

/**
 * 创建新问题
 */
export async function createAgreeQuestion(params: {
  toUserId: string;
  questionText: string;
  options: string[];
}): Promise<{ success: boolean; questionId?: string; error?: string }> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: '未登录' };
  }

  // 验证是否为好友
  const isFriend = await checkFriendship(user.id, params.toUserId);
  if (!isFriend) {
    return { success: false, error: '只能向好友提问' };
  }

  // 验证 options
  if (!Array.isArray(params.options) || params.options.length < 2) {
    return { success: false, error: '至少需要2个选项' };
  }

  // 创建 application 记录
  const { data: app, error: appError } = await supabase
    .from('applications')
    .insert({
      user_id: user.id,
      title: `问 ${params.toUserId.slice(0, 8)}...`,
      type: 'agree_question',
      description: params.questionText,
    })
    .select()
    .single();

  if (appError || !app) {
    console.error('Error creating application:', appError);
    return { success: false, error: '创建问题失败' };
  }

  // 创建 agree_questions 记录
  const { data: question, error: questionError } = await supabase
    .from('agree_questions')
    .insert({
      application_id: app.id,
      from_user_id: user.id,
      to_user_id: params.toUserId,
      question_text: params.questionText,
      options: params.options,
      status: 'pending',
    })
    .select()
    .single();

  if (questionError || !question) {
    console.error('Error creating question:', questionError);
    // 清理 application
    await supabase.from('applications').delete().eq('id', app.id);
    return { success: false, error: '创建问题失败' };
  }

  // TODO: 创建通知

  return { success: true, questionId: question.id };
}

/**
 * 获取发出的问题
 */
export async function getSentQuestions(): Promise<AgreeQuestionWithUsers[]> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return [];
  }

  const { data: questions, error } = await supabase
    .from('agree_questions')
    .select('*')
    .eq('from_user_id', user.id)
    .order('created_at', { ascending: false });

  if (error || !questions) {
    console.error('Error fetching sent questions:', error);
    return [];
  }

  return await enrichQuestionsWithUsers(questions);
}

/**
 * 获取收到的问题
 */
export async function getReceivedQuestions(): Promise<AgreeQuestionWithUsers[]> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return [];
  }

  const { data: questions, error } = await supabase
    .from('agree_questions')
    .select('*')
    .eq('to_user_id', user.id)
    .order('created_at', { ascending: false });

  if (error || !questions) {
    console.error('Error fetching received questions:', error);
    return [];
  }

  return await enrichQuestionsWithUsers(questions);
}

/**
 * 获取单个问题详情
 */
export async function getAgreeQuestion(questionId: string): Promise<AgreeQuestionWithUsers | null> {
  const supabase = await createClient();

  const { data: question, error } = await supabase
    .from('agree_questions')
    .select('*')
    .eq('id', questionId)
    .single();

  if (error || !question) {
    console.error('Error fetching question:', error);
    return null;
  }

  const enriched = await enrichQuestionsWithUsers([question]);
  return enriched[0] || null;
}

/**
 * 回答问题
 */
export async function answerQuestion(params: {
  questionId: string;
  answer: string;
}): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: '未登录' };
  }

  // 获取问题信息
  const { data: question } = await supabase
    .from('agree_questions')
    .select('*')
    .eq('id', params.questionId)
    .single();

  if (!question) {
    return { success: false, error: '问题不存在' };
  }

  // 验证权限
  if (question.to_user_id !== user.id) {
    return { success: false, error: '无权回答此问题' };
  }

  // 验证状态
  if (question.status !== 'pending') {
    return { success: false, error: '问题已回答或已过期' };
  }

  // 验证答案
  const options = question.options as string[];
  if (!options.includes(params.answer)) {
    return { success: false, error: '无效的答案选项' };
  }

  // 更新问题（原子操作）
  const { error } = await supabase
    .from('agree_questions')
    .update({
      answer: params.answer,
      status: 'answered',
      answered_at: new Date().toISOString(),
    })
    .eq('id', params.questionId)
    .eq('status', 'pending')
    .is('answer', null);

  if (error) {
    console.error('Error answering question:', error);
    return { success: false, error: '回答问题失败' };
  }

  // TODO: 创建通知

  return { success: true };
}

/**
 * 删除问题（仅提问者可删除 pending 状态的问题）
 */
export async function deleteQuestion(questionId: string): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: '未登录' };
  }

  // 获取问题的 application_id
  const { data: question } = await supabase
    .from('agree_questions')
    .select('application_id, from_user_id, status')
    .eq('id', questionId)
    .single();

  if (!question) {
    return { success: false, error: '问题不存在' };
  }

  if (question.from_user_id !== user.id) {
    return { success: false, error: '无权删除此问题' };
  }

  if (question.status !== 'pending') {
    return { success: false, error: '只能删除未回答的问题' };
  }

  // 删除 application（级联删除 agree_questions）
  const { error } = await supabase
    .from('applications')
    .delete()
    .eq('id', question.application_id);

  if (error) {
    console.error('Error deleting question:', error);
    return { success: false, error: '删除问题失败' };
  }

  return { success: true };
}

/**
 * 辅助函数：为问题列表添加用户信息
 */
async function enrichQuestionsWithUsers(questions: AgreeQuestion[]): Promise<AgreeQuestionWithUsers[]> {
  if (questions.length === 0) {
    return [];
  }

  const supabase = await createClient();

  // 提取所有相关用户 ID
  const userIds = new Set<string>();
  questions.forEach(q => {
    userIds.add(q.from_user_id);
    userIds.add(q.to_user_id);
  });

  // 获取用户信息（使用 profiles 表）
  const { data: profiles } = await supabase
    .from('profiles')
    .select('id, email, full_name, avatar_url')
    .in('id', Array.from(userIds));

  const userMap = new Map();
  profiles?.forEach(p => {
    userMap.set(p.id, {
      id: p.id,
      email: p.email,
      full_name: p.full_name,
      avatar_url: p.avatar_url,
    });
  });

  return questions.map(q => ({
    ...q,
    from_user: userMap.get(q.from_user_id) || { id: q.from_user_id, email: '' },
    to_user: userMap.get(q.to_user_id) || { id: q.to_user_id, email: '' },
  }));
}
