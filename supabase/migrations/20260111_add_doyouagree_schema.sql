-- =============================================================================
-- DoYouAgree Application - Database Schema
-- =============================================================================
--
-- Tables:
-- 1. friends - Bilateral friendship management
-- 2. agree_questions - Questions and answers records
-- 3. notifications - In-app notification system
--
-- =============================================================================

-- =============================================================================
-- Table: friends (friendship relationships)
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

-- Index optimization: friendship queries
CREATE INDEX IF NOT EXISTS idx_friends_user_id ON friends(user_id);
CREATE INDEX IF NOT EXISTS idx_friends_friend_id ON friends(friend_id);
CREATE INDEX IF NOT EXISTS idx_friends_status ON friends(status);

-- Auto-update updated_at
CREATE TRIGGER friends_updated_at
  BEFORE UPDATE ON friends
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =============================================================================
-- Table: agree_questions (question records)
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

-- Index optimization: question queries
CREATE INDEX IF NOT EXISTS idx_agree_questions_from_user ON agree_questions(from_user_id);
CREATE INDEX IF NOT EXISTS idx_agree_questions_to_user ON agree_questions(to_user_id);
CREATE INDEX IF NOT EXISTS idx_agree_questions_status ON agree_questions(status);
CREATE INDEX IF NOT EXISTS idx_agree_questions_app_id ON agree_questions(application_id);

-- =============================================================================
-- Table: notifications (notifications)
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

-- Index optimization: notification queries (user_id + read + time desc)
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id, read, created_at DESC);

-- =============================================================================
-- RLS Policies: friends
-- =============================================================================

ALTER TABLE friends ENABLE ROW LEVEL SECURITY;

-- Users can only view friendships related to themselves
CREATE POLICY friends_select ON friends
  FOR SELECT USING (
    auth.uid() = user_id OR auth.uid() = friend_id
  );

-- Users can only create friend requests initiated by themselves
CREATE POLICY friends_insert ON friends
  FOR INSERT WITH CHECK (
    auth.uid() = user_id AND status = 'pending'
  );

-- Can only update friend requests sent to themselves (accept/reject)
CREATE POLICY friends_update ON friends
  FOR UPDATE USING (
    auth.uid() = friend_id AND status = 'pending'
  );

-- Can delete friendships initiated or received by themselves
CREATE POLICY friends_delete ON friends
  FOR DELETE USING (
    auth.uid() = user_id OR auth.uid() = friend_id
  );

-- =============================================================================
-- RLS Policies: agree_questions
-- =============================================================================

ALTER TABLE agree_questions ENABLE ROW LEVEL SECURITY;

-- Only questioner and recipient can view
CREATE POLICY agree_questions_select ON agree_questions
  FOR SELECT USING (
    auth.uid() = from_user_id OR auth.uid() = to_user_id
  );

-- Can only create questions initiated by themselves
CREATE POLICY agree_questions_insert ON agree_questions
  FOR INSERT WITH CHECK (
    auth.uid() = from_user_id AND status = 'pending'
  );

-- Only recipient can update (answer question), and only once
CREATE POLICY agree_questions_update ON agree_questions
  FOR UPDATE USING (
    auth.uid() = to_user_id AND status = 'pending' AND answer IS NULL
  );

-- Questioner can delete unanswered questions
CREATE POLICY agree_questions_delete ON agree_questions
  FOR DELETE USING (
    auth.uid() = from_user_id AND status = 'pending'
  );

-- =============================================================================
-- RLS Policies: notifications
-- =============================================================================

ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Can only view own notifications
CREATE POLICY notifications_select ON notifications
  FOR SELECT USING (auth.uid() = user_id);

-- Can only update own notifications (mark as read)
CREATE POLICY notifications_update ON notifications
  FOR UPDATE USING (auth.uid() = user_id);

-- Can only delete own notifications
CREATE POLICY notifications_delete ON notifications
  FOR DELETE USING (auth.uid() = user_id);

-- =============================================================================
-- Table: profiles (user public profile)
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

-- Allow authenticated users to discover other users for friend requests
CREATE POLICY profiles_select_public ON profiles
  FOR SELECT USING (auth.uid() IS NOT NULL);

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

COMMENT ON TABLE profiles IS 'User public profile (mirrors auth.users metadata)';

-- =============================================================================
-- Friend Request Functions
-- =============================================================================

-- Accept friend request with transaction safety
CREATE OR REPLACE FUNCTION accept_friend_request_tx(request_id UUID)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_user_id UUID;
  v_friend_id UUID;
  v_status TEXT;
BEGIN
  -- Get and validate request
  SELECT user_id, friend_id, status INTO v_user_id, v_friend_id, v_status
  FROM friends
  WHERE id = request_id AND friend_id = auth.uid();

  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'Request not found or no permission');
  END IF;

  IF v_status != 'pending' THEN
    RETURN jsonb_build_object('success', false, 'error', 'Invalid request status');
  END IF;

  -- Update request to accepted
  UPDATE friends SET status = 'accepted' WHERE id = request_id;

  -- Create reverse relationship
  INSERT INTO friends (user_id, friend_id, status)
  VALUES (v_friend_id, v_user_id, 'accepted');

  RETURN jsonb_build_object('success', true);
EXCEPTION
  WHEN OTHERS THEN
    RETURN jsonb_build_object('success', false, 'error', 'Operation failed');
END;
$$;
