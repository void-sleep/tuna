# DoYouAgree Application Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Implement a social Q&A application where users can ask friends questions and receive answers with complete privacy and immutability guarantees.

**Architecture:** Hybrid approach using existing applications table for consistency while adding specialized friends, agree_questions, and notifications tables. Complete RLS policies ensure data isolation. Frontend uses Next.js 15 App Router with server-side rendering.

**Tech Stack:** Next.js 15, React 19, TypeScript, Supabase (PostgreSQL + Auth), Tailwind CSS, shadcn/ui

---

## Phase 1: Database Foundation

### Task 1.1: Create Database Migration File

**Files:**
- Create: `supabase/migrations/20260111_add_doyouagree_schema.sql`

**Step 1: Create migration file with friends table**

```sql
-- =============================================================================
-- DoYouAgree Application - Database Schema
-- =============================================================================
--
-- Tables:
-- 1. friends - 双向好友关系管理
-- 2. agree_questions - 问题和回答记录
-- 3. notifications - 站内通知系统
--
-- =============================================================================

-- =============================================================================
-- Table: friends (好友关系)
-- =============================================================================

CREATE TABLE friends (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  friend_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  status TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, friend_id),
  CHECK (user_id != friend_id)
);

-- 索引优化：好友关系查询
CREATE INDEX idx_friends_user_id ON friends(user_id);
CREATE INDEX idx_friends_friend_id ON friends(friend_id);
CREATE INDEX idx_friends_status ON friends(status);

-- 自动更新 updated_at
CREATE TRIGGER friends_updated_at
  BEFORE UPDATE ON friends
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =============================================================================
-- Table: agree_questions (问题记录)
-- =============================================================================

CREATE TABLE agree_questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id UUID NOT NULL REFERENCES applications(id) ON DELETE CASCADE,
  from_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  to_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  question_text TEXT NOT NULL,
  options JSONB NOT NULL,
  answer TEXT NULL,
  status TEXT NOT NULL,
  answered_at TIMESTAMPTZ NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  CHECK (from_user_id != to_user_id)
);

-- 索引优化：问题查询
CREATE INDEX idx_agree_questions_from_user ON agree_questions(from_user_id);
CREATE INDEX idx_agree_questions_to_user ON agree_questions(to_user_id);
CREATE INDEX idx_agree_questions_status ON agree_questions(status);
CREATE INDEX idx_agree_questions_app_id ON agree_questions(application_id);

-- =============================================================================
-- Table: notifications (通知)
-- =============================================================================

CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  link TEXT NULL,
  read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 索引优化：通知查询（user_id + read + 时间倒序）
CREATE INDEX idx_notifications_user_id ON notifications(user_id, read, created_at DESC);

-- =============================================================================
-- RLS Policies: friends
-- =============================================================================

ALTER TABLE friends ENABLE ROW LEVEL SECURITY;

-- 用户只能查看与自己相关的好友关系
CREATE POLICY friends_select ON friends
  FOR SELECT USING (
    auth.uid() = user_id OR auth.uid() = friend_id
  );

-- 用户只能创建自己发起的好友请求
CREATE POLICY friends_insert ON friends
  FOR INSERT WITH CHECK (
    auth.uid() = user_id AND status = 'pending'
  );

-- 只能更新发给自己的好友请求（接受/拒绝）
CREATE POLICY friends_update ON friends
  FOR UPDATE USING (
    auth.uid() = friend_id AND status = 'pending'
  );

-- 可以删除自己发起的或接收到的好友关系
CREATE POLICY friends_delete ON friends
  FOR DELETE USING (
    auth.uid() = user_id OR auth.uid() = friend_id
  );

-- =============================================================================
-- RLS Policies: agree_questions
-- =============================================================================

ALTER TABLE agree_questions ENABLE ROW LEVEL SECURITY;

-- 只有提问者和被提问者能查看
CREATE POLICY agree_questions_select ON agree_questions
  FOR SELECT USING (
    auth.uid() = from_user_id OR auth.uid() = to_user_id
  );

-- 只能创建自己发起的问题
CREATE POLICY agree_questions_insert ON agree_questions
  FOR INSERT WITH CHECK (
    auth.uid() = from_user_id AND status = 'pending'
  );

-- 只有被提问者可以更新（回答问题），且只能回答一次
CREATE POLICY agree_questions_update ON agree_questions
  FOR UPDATE USING (
    auth.uid() = to_user_id AND status = 'pending' AND answer IS NULL
  );

-- 提问者可以删除未回答的问题
CREATE POLICY agree_questions_delete ON agree_questions
  FOR DELETE USING (
    auth.uid() = from_user_id AND status = 'pending'
  );

-- =============================================================================
-- RLS Policies: notifications
-- =============================================================================

ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- 只能查看自己的通知
CREATE POLICY notifications_select ON notifications
  FOR SELECT USING (auth.uid() = user_id);

-- 只能更新自己的通知（标记已读）
CREATE POLICY notifications_update ON notifications
  FOR UPDATE USING (auth.uid() = user_id);

-- 只能删除自己的通知
CREATE POLICY notifications_delete ON notifications
  FOR DELETE USING (auth.uid() = user_id);
```

**Step 2: Verify migration file**

Run: `cat supabase/migrations/20260111_add_doyouagree_schema.sql | head -20`
Expected: File exists and shows SQL content

**Step 3: Commit migration**

```bash
git add supabase/migrations/20260111_add_doyouagree_schema.sql
git commit -m "feat(db): add DoYouAgree schema with friends, questions, and notifications tables

- Create friends table with RLS for bilateral friendship
- Create agree_questions table with immutability constraints
- Create notifications table for in-app alerts
- Add comprehensive indexes for query optimization
- Implement strict RLS policies for data isolation"
```

### Task 1.2: Create TypeScript Types

**Files:**
- Create: `lib/types/doyouagree.ts`

**Step 1: Create type definitions**

```typescript
// Friend relationship types
export interface Friend {
  id: string;
  user_id: string;
  friend_id: string;
  status: 'pending' | 'accepted' | 'rejected';
  created_at: string;
  updated_at: string;
}

// User profile (for display in friend lists)
export interface UserProfile {
  id: string;
  email: string;
  full_name?: string;
  avatar_url?: string;
}

// Agree question types
export interface AgreeQuestion {
  id: string;
  application_id: string;
  from_user_id: string;
  to_user_id: string;
  question_text: string;
  options: string[];
  answer: string | null;
  status: 'pending' | 'answered' | 'expired';
  answered_at: string | null;
  created_at: string;
}

// Notification types
export interface Notification {
  id: string;
  user_id: string;
  type: 'friend_request' | 'new_question' | 'question_answered';
  title: string;
  content: string;
  link: string | null;
  read: boolean;
  created_at: string;
}

// Extended types with user info
export interface FriendWithUser extends Friend {
  user: UserProfile;
  friend: UserProfile;
}

export interface AgreeQuestionWithUsers extends AgreeQuestion {
  from_user: UserProfile;
  to_user: UserProfile;
}
```

**Step 2: Verify types compile**

Run: `npx tsc --noEmit lib/types/doyouagree.ts`
Expected: No compilation errors

**Step 3: Commit types**

```bash
git add lib/types/doyouagree.ts
git commit -m "feat(types): add TypeScript types for DoYouAgree feature

- Define Friend, AgreeQuestion, and Notification interfaces
- Add UserProfile for displaying user information
- Include extended types with joined user data"
```

### Task 1.3: Create Supabase Query Functions - Friends

**Files:**
- Create: `lib/supabase/friends.ts`

**Step 1: Implement friends query functions**

```typescript
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
  const { data: users } = await supabase.auth.admin.listUsers();
  const userMap = new Map<string, UserProfile>();

  users?.users.forEach(u => {
    if (userIds.has(u.id)) {
      userMap.set(u.id, {
        id: u.id,
        email: u.email || '',
        full_name: u.user_metadata?.full_name || u.user_metadata?.name,
        avatar_url: u.user_metadata?.avatar_url,
      });
    }
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
  const { data: users } = await supabase.auth.admin.listUsers();
  const userMap = new Map<string, UserProfile>();

  users?.users.forEach(u => {
    if (senderIds.includes(u.id)) {
      userMap.set(u.id, {
        id: u.id,
        email: u.email || '',
        full_name: u.user_metadata?.full_name || u.user_metadata?.name,
        avatar_url: u.user_metadata?.avatar_url,
      });
    }
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
  const { data: users } = await supabase.auth.admin.listUsers();
  const userMap = new Map<string, UserProfile>();

  users?.users.forEach(u => {
    if (receiverIds.includes(u.id)) {
      userMap.set(u.id, {
        id: u.id,
        email: u.email || '',
        full_name: u.user_metadata?.full_name || u.user_metadata?.name,
        avatar_url: u.user_metadata?.avatar_url,
      });
    }
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

  // 更新请求状态为 accepted
  const { error: updateError } = await supabase
    .from('friends')
    .update({ status: 'accepted' })
    .eq('id', requestId)
    .eq('status', 'pending');

  if (updateError) {
    console.error('Error accepting friend request:', updateError);
    return { success: false, error: '接受好友请求失败' };
  }

  // 获取请求信息以创建反向关系
  const { data: request } = await supabase
    .from('friends')
    .select('user_id, friend_id')
    .eq('id', requestId)
    .single();

  if (!request) {
    return { success: false, error: '请求不存在' };
  }

  // 创建反向关系（双向好友）
  const { error: insertError } = await supabase
    .from('friends')
    .insert({
      user_id: request.friend_id,
      friend_id: request.user_id,
      status: 'accepted',
    });

  if (insertError) {
    console.error('Error creating reverse friendship:', insertError);
    // 回滚
    await supabase
      .from('friends')
      .update({ status: 'pending' })
      .eq('id', requestId);
    return { success: false, error: '创建好友关系失败' };
  }

  // TODO: 创建通知

  return { success: true };
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

  // 使用 Supabase Auth Admin API 搜索用户
  const { data: users } = await supabase.auth.admin.listUsers();

  if (!users) {
    return [];
  }

  const lowerQuery = query.toLowerCase();

  return users.users
    .filter(u => {
      if (u.id === user.id) return false; // 排除自己

      const email = u.email?.toLowerCase() || '';
      const fullName = u.user_metadata?.full_name?.toLowerCase() || u.user_metadata?.name?.toLowerCase() || '';

      return email.includes(lowerQuery) || fullName.includes(lowerQuery);
    })
    .slice(0, 10) // 限制返回数量
    .map(u => ({
      id: u.id,
      email: u.email || '',
      full_name: u.user_metadata?.full_name || u.user_metadata?.name,
      avatar_url: u.user_metadata?.avatar_url,
    }));
}
```

**Step 2: Verify TypeScript compilation**

Run: `npx tsc --noEmit lib/supabase/friends.ts`
Expected: No compilation errors

**Step 3: Commit friends queries**

```bash
git add lib/supabase/friends.ts
git commit -m "feat(api): add friends query functions

- Implement checkFriendship for bilateral verification
- Add getFriends, getReceivedFriendRequests, getSentFriendRequests
- Implement sendFriendRequest with duplicate checking
- Add acceptFriendRequest with reverse relationship creation
- Implement rejectFriendRequest and deleteFriend
- Add searchUsers for finding users by email or name"
```

### Task 1.4: Create Supabase Query Functions - Agree Questions

**Files:**
- Create: `lib/supabase/agree-questions.ts`

**Step 1: Implement agree_questions query functions**

```typescript
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

  // 获取用户信息
  const { data: users } = await supabase.auth.admin.listUsers();
  const userMap = new Map();

  users?.users.forEach(u => {
    if (userIds.has(u.id)) {
      userMap.set(u.id, {
        id: u.id,
        email: u.email || '',
        full_name: u.user_metadata?.full_name || u.user_metadata?.name,
        avatar_url: u.user_metadata?.avatar_url,
      });
    }
  });

  return questions.map(q => ({
    ...q,
    from_user: userMap.get(q.from_user_id) || { id: q.from_user_id, email: '' },
    to_user: userMap.get(q.to_user_id) || { id: q.to_user_id, email: '' },
  }));
}
```

**Step 2: Verify TypeScript compilation**

Run: `npx tsc --noEmit lib/supabase/agree-questions.ts`
Expected: No compilation errors

**Step 3: Commit agree-questions queries**

```bash
git add lib/supabase/agree-questions.ts
git commit -m "feat(api): add agree_questions query functions

- Implement createAgreeQuestion with friendship verification
- Add getSentQuestions and getReceivedQuestions
- Implement getAgreeQuestion for single question retrieval
- Add answerQuestion with validation and immutability
- Implement deleteQuestion with status checking
- Add enrichQuestionsWithUsers helper for user info"
```

### Task 1.5: Create Supabase Query Functions - Notifications

**Files:**
- Create: `lib/supabase/notifications.ts`

**Step 1: Implement notifications query functions**

```typescript
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
```

**Step 2: Verify TypeScript compilation**

Run: `npx tsc --noEmit lib/supabase/notifications.ts`
Expected: No compilation errors

**Step 3: Commit notifications queries**

```bash
git add lib/supabase/notifications.ts
git commit -m "feat(api): add notifications query functions

- Implement getNotifications with unread filter
- Add getUnreadNotificationCount for badge display
- Implement markNotificationAsRead and markAllNotificationsAsRead
- Add deleteNotification for cleanup
- Implement createNotification for internal use"
```

---

## Phase 2: Friends System UI

### Task 2.1: Add Friends Route and Page

**Files:**
- Create: `app/apps/friends/page.tsx`

**Step 1: Create friends page**

```typescript
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getFriends, getReceivedFriendRequests, getSentFriendRequests } from "@/lib/supabase/friends";
import { getTranslations } from "next-intl/server";
import { FriendsPageClient } from "@/components/friends-page-client";

export default async function FriendsPage() {
  const supabase = await createClient();
  const t = await getTranslations('friends');

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    redirect("/auth/login");
  }

  const [friends, receivedRequests, sentRequests] = await Promise.all([
    getFriends(),
    getReceivedFriendRequests(),
    getSentFriendRequests(),
  ]);

  return (
    <FriendsPageClient
      friends={friends}
      receivedRequests={receivedRequests}
      sentRequests={sentRequests}
    />
  );
}
```

**Step 2: Verify page compiles**

Run: `npx tsc --noEmit app/apps/friends/page.tsx`
Expected: May show errors for missing FriendsPageClient component (we'll create it next)

**Step 3: Commit friends page**

```bash
git add app/apps/friends/page.tsx
git commit -m "feat(ui): add friends management page

- Create server component for friends page
- Fetch friends, received requests, and sent requests
- Add authentication check and redirect"
```

### Task 2.2: Create FriendsPageClient Component

**Files:**
- Create: `components/friends-page-client.tsx`

**Step 1: Create client component**

```typescript
'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card } from '@/components/ui/card';
import { UserSearchInput } from '@/components/user-search-input';
import { FriendsList } from '@/components/friends-list';
import { FriendRequestList } from '@/components/friend-request-list';
import type { FriendWithUser } from '@/lib/types/doyouagree';
import { UsersIcon } from '@heroicons/react/24/outline';

interface FriendsPageClientProps {
  friends: FriendWithUser[];
  receivedRequests: FriendWithUser[];
  sentRequests: FriendWithUser[];
}

export function FriendsPageClient({
  friends: initialFriends,
  receivedRequests: initialReceived,
  sentRequests: initialSent,
}: FriendsPageClientProps) {
  const t = useTranslations('friends');
  const [friends, setFriends] = useState(initialFriends);
  const [receivedRequests, setReceivedRequests] = useState(initialReceived);
  const [sentRequests, setSentRequests] = useState(initialSent);

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-slate-50/50 dark:bg-slate-950">
      <div className="max-w-5xl mx-auto px-4 md:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-violet-600 flex items-center justify-center">
              <UsersIcon className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
                {t('title')}
              </h1>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                {friends.length} {t('myFriends')}
              </p>
            </div>
          </div>
        </div>

        {/* Search */}
        <Card className="p-4 mb-6">
          <UserSearchInput
            onRequestSent={() => {
              // Refresh sent requests
              window.location.reload();
            }}
          />
        </Card>

        {/* Tabs */}
        <Tabs defaultValue="friends" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="friends">
              {t('myFriends')} ({friends.length})
            </TabsTrigger>
            <TabsTrigger value="received">
              {t('received')} ({receivedRequests.length})
            </TabsTrigger>
            <TabsTrigger value="sent">
              {t('sent')} ({sentRequests.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="friends" className="mt-6">
            <FriendsList
              friends={friends}
              onFriendDeleted={(friendId) => {
                setFriends(friends.filter(f => f.friend.id !== friendId));
              }}
            />
          </TabsContent>

          <TabsContent value="received" className="mt-6">
            <FriendRequestList
              requests={receivedRequests}
              type="received"
              onRequestHandled={(requestId) => {
                setReceivedRequests(receivedRequests.filter(r => r.id !== requestId));
                // Refresh friends list
                window.location.reload();
              }}
            />
          </TabsContent>

          <TabsContent value="sent" className="mt-6">
            <FriendRequestList
              requests={sentRequests}
              type="sent"
              onRequestHandled={(requestId) => {
                setSentRequests(sentRequests.filter(r => r.id !== requestId));
              }}
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
```

**Step 2: Commit client component**

```bash
git add components/friends-page-client.tsx
git commit -m "feat(ui): add friends page client component

- Create tabbed interface for friends management
- Add tabs for friends, received requests, and sent requests
- Integrate user search component
- Handle state updates for friend operations"
```

### Task 2.3: Create UserSearchInput Component

**Files:**
- Create: `components/user-search-input.tsx`

**Step 1: Create search input component**

```typescript
'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { MagnifyingGlassIcon, UserPlusIcon } from '@heroicons/react/24/outline';
import { searchUsers } from '@/lib/supabase/friends';
import { sendFriendRequest } from '@/lib/supabase/friends';
import type { UserProfile } from '@/lib/types/doyouagree';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

interface UserSearchInputProps {
  onRequestSent?: () => void;
}

export function UserSearchInput({ onRequestSent }: UserSearchInputProps) {
  const t = useTranslations('friends');
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<UserProfile[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [sendingTo, setSendingTo] = useState<string | null>(null);

  const handleSearch = async () => {
    if (!query.trim()) {
      setResults([]);
      return;
    }

    setIsSearching(true);
    const users = await searchUsers(query);
    setResults(users);
    setIsSearching(false);
  };

  const handleSendRequest = async (userId: string) => {
    setSendingTo(userId);
    const result = await sendFriendRequest(userId);
    setSendingTo(null);

    if (result.success) {
      toast.success('好友请求已发送');
      setResults(results.filter(u => u.id !== userId));
      onRequestSent?.();
    } else {
      toast.error(result.error || '发送失败');
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <div className="relative flex-1">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            placeholder={t('search')}
            className="pl-10"
          />
        </div>
        <Button
          onClick={handleSearch}
          disabled={isSearching || !query.trim()}
        >
          {isSearching ? '搜索中...' : '搜索'}
        </Button>
      </div>

      {results.length > 0 && (
        <div className="space-y-2">
          {results.map((user) => (
            <Card key={user.id} className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-violet-100 dark:bg-violet-900 flex items-center justify-center">
                    <span className="text-sm font-medium text-violet-600 dark:text-violet-400">
                      {user.full_name?.[0] || user.email[0].toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <p className="font-medium text-slate-900 dark:text-white">
                      {user.full_name || user.email}
                    </p>
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                      {user.email}
                    </p>
                  </div>
                </div>
                <Button
                  size="sm"
                  onClick={() => handleSendRequest(user.id)}
                  disabled={sendingTo === user.id}
                  className="gap-2"
                >
                  <UserPlusIcon className="h-4 w-4" />
                  {sendingTo === user.id ? '发送中...' : t('addFriend')}
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {query && !isSearching && results.length === 0 && (
        <p className="text-center text-sm text-slate-500 dark:text-slate-400">
          未找到用户
        </p>
      )}
    </div>
  );
}
```

**Step 2: Commit search input**

```bash
git add components/user-search-input.tsx
git commit -m "feat(ui): add user search input component

- Create search interface for finding users
- Display search results with user info
- Add send friend request button
- Handle loading and error states"
```

### Task 2.4: Create FriendsList Component

**Files:**
- Create: `components/friends-list.tsx`

**Step 1: Create friends list component**

```typescript
'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { UserMinusIcon } from '@heroicons/react/24/outline';
import { deleteFriend } from '@/lib/supabase/friends';
import type { FriendWithUser } from '@/lib/types/doyouagree';
import { toast } from 'sonner';

interface FriendsListProps {
  friends: FriendWithUser[];
  onFriendDeleted?: (friendId: string) => void;
}

export function FriendsList({ friends, onFriendDeleted }: FriendsListProps) {
  const t = useTranslations('friends');
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleDelete = async (friendId: string) => {
    setDeletingId(friendId);
    const result = await deleteFriend(friendId);
    setDeletingId(null);

    if (result.success) {
      toast.success('已删除好友');
      onFriendDeleted?.(friendId);
    } else {
      toast.error(result.error || '删除失败');
    }
  };

  if (friends.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-slate-500 dark:text-slate-400">
          {t('noFriends')}
        </p>
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2">
      {friends.map((friendship) => {
        const friend = friendship.friend;
        return (
          <Card key={friendship.id} className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-violet-100 dark:bg-violet-900 flex items-center justify-center">
                  <span className="text-lg font-medium text-violet-600 dark:text-violet-400">
                    {friend.full_name?.[0] || friend.email[0].toUpperCase()}
                  </span>
                </div>
                <div>
                  <p className="font-medium text-slate-900 dark:text-white">
                    {friend.full_name || friend.email}
                  </p>
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    {friend.email}
                  </p>
                </div>
              </div>

              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    disabled={deletingId === friend.id}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950"
                  >
                    <UserMinusIcon className="h-4 w-4" />
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>删除好友</AlertDialogTitle>
                    <AlertDialogDescription>
                      确定要删除好友 {friend.full_name || friend.email} 吗？
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>取消</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={() => handleDelete(friend.id)}
                      className="bg-red-600 hover:bg-red-700"
                    >
                      删除
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </Card>
        );
      })}
    </div>
  );
}
```

**Step 2: Commit friends list**

```bash
git add components/friends-list.tsx
git commit -m "feat(ui): add friends list component

- Display friends in grid layout
- Add delete friend with confirmation dialog
- Show user avatars and names
- Handle empty state"
```

### Task 2.5: Create FriendRequestList Component

**Files:**
- Create: `components/friend-request-list.tsx`

**Step 1: Create friend request list component**

```typescript
'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { acceptFriendRequest, rejectFriendRequest } from '@/lib/supabase/friends';
import type { FriendWithUser } from '@/lib/types/doyouagree';
import { toast } from 'sonner';

interface FriendRequestListProps {
  requests: FriendWithUser[];
  type: 'received' | 'sent';
  onRequestHandled?: (requestId: string) => void;
}

export function FriendRequestList({ requests, type, onRequestHandled }: FriendRequestListProps) {
  const t = useTranslations('friends');
  const [processingId, setProcessingId] = useState<string | null>(null);

  const handleAccept = async (requestId: string) => {
    setProcessingId(requestId);
    const result = await acceptFriendRequest(requestId);
    setProcessingId(null);

    if (result.success) {
      toast.success('已接受好友请求');
      onRequestHandled?.(requestId);
    } else {
      toast.error(result.error || '操作失败');
    }
  };

  const handleReject = async (requestId: string) => {
    setProcessingId(requestId);
    const result = await rejectFriendRequest(requestId);
    setProcessingId(null);

    if (result.success) {
      toast.success('已拒绝好友请求');
      onRequestHandled?.(requestId);
    } else {
      toast.error(result.error || '操作失败');
    }
  };

  if (requests.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-slate-500 dark:text-slate-400">
          {type === 'received' ? '暂无待处理的好友请求' : '暂无已发送的好友请求'}
        </p>
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2">
      {requests.map((request) => {
        const displayUser = type === 'received' ? request.user : request.friend;
        return (
          <Card key={request.id} className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-violet-100 dark:bg-violet-900 flex items-center justify-center">
                  <span className="text-lg font-medium text-violet-600 dark:text-violet-400">
                    {displayUser.full_name?.[0] || displayUser.email[0].toUpperCase()}
                  </span>
                </div>
                <div>
                  <p className="font-medium text-slate-900 dark:text-white">
                    {displayUser.full_name || displayUser.email}
                  </p>
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    {displayUser.email}
                  </p>
                  {type === 'sent' && (
                    <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
                      等待对方同意
                    </p>
                  )}
                </div>
              </div>

              {type === 'received' && (
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleAccept(request.id)}
                    disabled={processingId === request.id}
                    className="text-green-600 hover:text-green-700 hover:bg-green-50 dark:hover:bg-green-950"
                  >
                    <CheckIcon className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleReject(request.id)}
                    disabled={processingId === request.id}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950"
                  >
                    <XMarkIcon className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </div>
          </Card>
        );
      })}
    </div>
  );
}
```

**Step 2: Commit friend request list**

```bash
git add components/friend-request-list.tsx
git commit -m "feat(ui): add friend request list component

- Display received and sent friend requests
- Add accept/reject buttons for received requests
- Show pending status for sent requests
- Handle loading and error states"
```

### Task 2.6: Add Translations for Friends

**Files:**
- Modify: `messages/en.json`
- Modify: `messages/zh-CN.json`

**Step 1: Add English translations**

```json
{
  "friends": {
    "title": "Friends",
    "myFriends": "My Friends",
    "received": "Received",
    "sent": "Sent",
    "search": "Search by name or email...",
    "addFriend": "Add Friend",
    "accept": "Accept",
    "reject": "Reject",
    "noFriends": "No friends yet",
    "deleteFriend": "Delete Friend",
    "confirmDelete": "Are you sure you want to delete this friend?"
  }
}
```

**Step 2: Add Chinese translations**

```json
{
  "friends": {
    "title": "好友管理",
    "myFriends": "我的好友",
    "received": "待处理",
    "sent": "已发送",
    "search": "搜索用户名或邮箱...",
    "addFriend": "添加好友",
    "accept": "接受",
    "reject": "拒绝",
    "noFriends": "还没有好友",
    "deleteFriend": "删除好友",
    "confirmDelete": "确定要删除这个好友吗？"
  }
}
```

**Step 3: Commit translations**

```bash
git add messages/en.json messages/zh-CN.json
git commit -m "feat(i18n): add translations for friends feature

- Add English translations for friends management
- Add Chinese translations for friends management
- Cover all UI text for friends page"
```

---

## Phase 3: Agree Questions UI

*(To be continued with Tasks 3.1-3.6: Create question UI, edit page, run page, question cards, answer dialog, and translations)*

---

## Phase 4: Notifications System

*(To be continued with Tasks 4.1-4.4: Notification bell, notification dropdown, notification page, and integration with friends/questions)*

---

## Phase 5: Polish and Testing

*(To be continued with Tasks 5.1-5.5: Error handling, loading states, empty states, E2E testing, and final review)*

---

## Execution Strategy

This plan is extensive and should be executed in phases. Recommended approach:

1. **Phase 1 Complete** - Test database and API functions manually using Supabase dashboard
2. **Phase 2 Complete** - Test friends system end-to-end in browser
3. **Phase 3 Complete** - Test question creation and answering
4. **Phase 4 Complete** - Test notifications
5. **Phase 5 Complete** - Final polish and testing

After each phase, commit and push, then review before proceeding to the next phase.
