-- =============================================================================
-- DoYouAgree Application - Combined Database Schema
-- =============================================================================
-- This is a combined migration from:
-- - 20260111_doyouagree_complete.sql
-- - 20260112_setup_avatars_storage.sql
-- - 20260112_fix_avatars_storage.sql
-- =============================================================================
--
-- Tables:
-- 1. profiles - User public profile (mirrors auth.users metadata)
-- 2. friends - Bilateral friendship management
-- 3. agree_questions - Questions and answers records
-- 4. notifications - In-app notification system
-- 5. Storage bucket: avatars - User avatar images
--
-- =============================================================================

-- =============================================================================
-- Table: profiles (user public profile)
-- =============================================================================

-- Create profiles table to mirror auth.users metadata
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  searchable BOOLEAN DEFAULT TRUE NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for quick lookups
CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email);
CREATE INDEX IF NOT EXISTS idx_profiles_searchable_email ON profiles(searchable, email) WHERE searchable = true;

-- Trigger to keep profiles updated_at current
CREATE TRIGGER profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

COMMENT ON TABLE profiles IS 'User public profile (mirrors auth.users metadata)';
COMMENT ON COLUMN profiles.searchable IS 'Whether user can be found in search (privacy control)';

-- =============================================================================
-- RLS Policies: profiles
-- =============================================================================

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to discover other users for friend requests
CREATE POLICY profiles_select ON profiles
  FOR SELECT
  TO authenticated
  USING (true);

-- Users can update their own profile
CREATE POLICY profiles_update_own ON profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Users can insert their own profile (on signup)
CREATE POLICY profiles_insert_own ON profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- =============================================================================
-- Auto-sync profiles from auth.users
-- =============================================================================

-- When a user signs up, automatically create their profile record
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$$;

-- Trigger on auth.users insert
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user();

-- Backfill existing users (for users that signed up before this migration)
INSERT INTO public.profiles (id, email, full_name, avatar_url, created_at)
SELECT
  id,
  email,
  raw_user_meta_data->>'full_name',
  raw_user_meta_data->>'avatar_url',
  created_at
FROM auth.users
WHERE id NOT IN (SELECT id FROM public.profiles)
ON CONFLICT (id) DO NOTHING;

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
CREATE POLICY friends_update ON friends FOR
UPDATE USING (
    auth.uid() = friend_id
    AND status = 'pending'
  ) WITH CHECK (
    auth.uid() = friend_id
    AND status IN ('accepted', 'rejected')
  );

-- Can delete friendships initiated or received by themselves
CREATE POLICY friends_delete ON friends
  FOR DELETE USING (
    auth.uid() = user_id OR auth.uid() = friend_id
  );

-- =============================================================================
-- Table: agree_questions (question records)
-- =============================================================================

CREATE TABLE IF NOT EXISTS agree_questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id UUID NOT NULL REFERENCES applications(id) ON DELETE CASCADE,
  from_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  to_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  question_text TEXT NULL,
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

-- Additional indexes for new query patterns (bilateral timeline, pending questions)
CREATE INDEX IF NOT EXISTS idx_aq_to_user_pending ON agree_questions(to_user_id, status) WHERE status = 'pending';
CREATE INDEX IF NOT EXISTS idx_aq_user_pair_time ON agree_questions(LEAST(from_user_id, to_user_id), GREATEST(from_user_id, to_user_id), created_at DESC);
CREATE INDEX IF NOT EXISTS idx_aq_app_time ON agree_questions(application_id, created_at DESC);

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
-- USING: controls which rows can be selected for update
-- WITH CHECK: controls what values are allowed after update
CREATE POLICY agree_questions_update ON agree_questions
  FOR UPDATE
  USING (
    auth.uid() = to_user_id AND status = 'pending' AND answer IS NULL
  )
  WITH CHECK (
    auth.uid() = to_user_id AND status = 'answered' AND answer IS NOT NULL
  );

-- Questioner can delete unanswered questions
CREATE POLICY agree_questions_delete ON agree_questions
  FOR DELETE USING (
    auth.uid() = from_user_id AND status = 'pending'
  );

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

-- =============================================================================
-- Storage: Avatars Bucket
-- =============================================================================

-- Create avatars bucket (public for avatar display)
INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO UPDATE SET public = true;


-- Enable RLS on storage.objects
-- ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Policy: Allow authenticated users to upload to avatars bucket
CREATE POLICY "Authenticated users can upload avatars"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'avatars');

-- Policy: Allow everyone to read avatars (public bucket)
CREATE POLICY "Public can read avatars"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'avatars');

-- Policy: Allow authenticated users to update files in avatars bucket
CREATE POLICY "Authenticated users can update avatars"
ON storage.objects
FOR UPDATE
TO authenticated
USING (bucket_id = 'avatars')
WITH CHECK (bucket_id = 'avatars');

-- Policy: Allow authenticated users to delete files in avatars bucket
CREATE POLICY "Authenticated users can delete avatars"
ON storage.objects
FOR DELETE
TO authenticated
USING (bucket_id = 'avatars');
