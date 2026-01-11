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

CREATE TABLE IF NOT EXISTS friends (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  friend_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  status TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, friend_id),
  CHECK (user_id != friend_id)
);

-- 索引优化：好友关系查询
CREATE INDEX IF NOT EXISTS idx_friends_user_id ON friends(user_id);
CREATE INDEX IF NOT EXISTS idx_friends_friend_id ON friends(friend_id);
CREATE INDEX IF NOT EXISTS idx_friends_status ON friends(status);

-- 自动更新 updated_at
CREATE TRIGGER friends_updated_at
  BEFORE UPDATE ON friends
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =============================================================================
-- Table: agree_questions (问题记录)
-- =============================================================================

CREATE TABLE IF NOT EXISTS agree_questions (
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
CREATE INDEX IF NOT EXISTS idx_agree_questions_from_user ON agree_questions(from_user_id);
CREATE INDEX IF NOT EXISTS idx_agree_questions_to_user ON agree_questions(to_user_id);
CREATE INDEX IF NOT EXISTS idx_agree_questions_status ON agree_questions(status);
CREATE INDEX IF NOT EXISTS idx_agree_questions_app_id ON agree_questions(application_id);

-- =============================================================================
-- Table: notifications (通知)
-- =============================================================================

CREATE TABLE IF NOT EXISTS notifications (
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
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id, read, created_at DESC);

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

-- =============================================================================
-- Table: profiles (用户公开资料)
-- =============================================================================

-- Create profiles table to mirror auth.users metadata
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for quick lookups
CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email);

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Users can view their own profile
CREATE POLICY profiles_select_own ON profiles
  FOR SELECT USING (auth.uid() = id);

-- Users can view profiles of their accepted friends
CREATE POLICY profiles_select_friends ON profiles
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM friends
      WHERE ((user_id = auth.uid() AND friend_id = profiles.id)
          OR (friend_id = auth.uid() AND user_id = profiles.id))
        AND status = 'accepted'
    )
  );

-- Users can update their own profile
CREATE POLICY profiles_update_own ON profiles
  FOR UPDATE USING (auth.uid() = id);

-- Users can insert their own profile (on signup)
CREATE POLICY profiles_insert_own ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Trigger to keep profiles updated_at current
CREATE TRIGGER profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

COMMENT ON TABLE profiles IS '用户公开资料（镜像 auth.users 元数据）';
