-- DoYouAgree Application Database Schema
-- This migration creates tables for friends management, agree questions, and notifications
-- All tables include RLS policies for data isolation and security

-- ============================================================================
-- Table: friends
-- Purpose: Manages friend relationships between users
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.friends (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  friend_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  status TEXT NOT NULL CHECK (status IN ('pending', 'accepted', 'rejected', 'blocked')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Constraints
  CONSTRAINT unique_friendship UNIQUE (user_id, friend_id),
  CONSTRAINT no_self_friendship CHECK (user_id != friend_id)
);

-- Indexes for friends table
CREATE INDEX IF NOT EXISTS idx_friends_user_id ON public.friends(user_id);
CREATE INDEX IF NOT EXISTS idx_friends_friend_id ON public.friends(friend_id);
CREATE INDEX IF NOT EXISTS idx_friends_status ON public.friends(status);
CREATE INDEX IF NOT EXISTS idx_friends_user_status ON public.friends(user_id, status);

-- Trigger function for auto-updating updated_at
CREATE OR REPLACE FUNCTION public.update_friends_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for friends table
DROP TRIGGER IF EXISTS trigger_update_friends_updated_at ON public.friends;
CREATE TRIGGER trigger_update_friends_updated_at
  BEFORE UPDATE ON public.friends
  FOR EACH ROW
  EXECUTE FUNCTION public.update_friends_updated_at();

-- Enable RLS on friends table
ALTER TABLE public.friends ENABLE ROW LEVEL SECURITY;

-- RLS Policies for friends table
-- Policy: Users can view friend requests they sent or received
CREATE POLICY friends_select_policy ON public.friends
  FOR SELECT
  USING (
    auth.uid() = user_id OR auth.uid() = friend_id
  );

-- Policy: Users can create friend requests (as sender)
CREATE POLICY friends_insert_policy ON public.friends
  FOR INSERT
  WITH CHECK (
    auth.uid() = user_id
  );

-- Policy: Users can update friend requests they sent or received
CREATE POLICY friends_update_policy ON public.friends
  FOR UPDATE
  USING (
    auth.uid() = user_id OR auth.uid() = friend_id
  )
  WITH CHECK (
    auth.uid() = user_id OR auth.uid() = friend_id
  );

-- Policy: Users can delete friend requests they sent
CREATE POLICY friends_delete_policy ON public.friends
  FOR DELETE
  USING (
    auth.uid() = user_id
  );

-- ============================================================================
-- Table: agree_questions
-- Purpose: Stores questions asked between friends with agree/disagree answers
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.agree_questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  asker_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  responder_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  question TEXT NOT NULL,
  asker_answer BOOLEAN,
  responder_answer BOOLEAN,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'answered', 'skipped')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  answered_at TIMESTAMPTZ,

  -- Constraints
  CONSTRAINT no_self_question CHECK (asker_id != responder_id),
  CONSTRAINT question_not_empty CHECK (LENGTH(TRIM(question)) > 0)
);

-- Indexes for agree_questions table
CREATE INDEX IF NOT EXISTS idx_agree_questions_asker_id ON public.agree_questions(asker_id);
CREATE INDEX IF NOT EXISTS idx_agree_questions_responder_id ON public.agree_questions(responder_id);
CREATE INDEX IF NOT EXISTS idx_agree_questions_status ON public.agree_questions(status);
CREATE INDEX IF NOT EXISTS idx_agree_questions_created_at ON public.agree_questions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_agree_questions_responder_status ON public.agree_questions(responder_id, status);

-- Enable RLS on agree_questions table
ALTER TABLE public.agree_questions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for agree_questions table
-- Policy: Users can view questions they asked or were asked
CREATE POLICY agree_questions_select_policy ON public.agree_questions
  FOR SELECT
  USING (
    auth.uid() = asker_id OR auth.uid() = responder_id
  );

-- Policy: Users can create questions for their friends
CREATE POLICY agree_questions_insert_policy ON public.agree_questions
  FOR INSERT
  WITH CHECK (
    auth.uid() = asker_id AND
    -- Ensure responder is an accepted friend
    EXISTS (
      SELECT 1 FROM public.friends
      WHERE (user_id = auth.uid() AND friend_id = responder_id AND status = 'accepted')
         OR (user_id = responder_id AND friend_id = auth.uid() AND status = 'accepted')
    )
  );

-- Policy: Users can update questions they asked or were asked
CREATE POLICY agree_questions_update_policy ON public.agree_questions
  FOR UPDATE
  USING (
    auth.uid() = asker_id OR auth.uid() = responder_id
  )
  WITH CHECK (
    auth.uid() = asker_id OR auth.uid() = responder_id
  );

-- Policy: Users can delete questions they asked
CREATE POLICY agree_questions_delete_policy ON public.agree_questions
  FOR DELETE
  USING (
    auth.uid() = asker_id
  );

-- ============================================================================
-- Table: notifications
-- Purpose: Stores notifications for friend requests and question activities
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('friend_request', 'friend_accepted', 'question_received', 'question_answered')),
  content JSONB NOT NULL,
  is_read BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Constraints
  CONSTRAINT content_not_empty CHECK (content IS NOT NULL AND content != '{}'::jsonb)
);

-- Indexes for notifications table
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON public.notifications(is_read);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON public.notifications(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_user_unread ON public.notifications(user_id, is_read) WHERE is_read = FALSE;

-- Enable RLS on notifications table
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- RLS Policies for notifications table
-- Policy: Users can only view their own notifications
CREATE POLICY notifications_select_policy ON public.notifications
  FOR SELECT
  USING (
    auth.uid() = user_id
  );

-- Policy: System can create notifications (in practice, will be done via service role or triggers)
-- For now, allow users to create notifications for themselves (can be restricted later)
CREATE POLICY notifications_insert_policy ON public.notifications
  FOR INSERT
  WITH CHECK (
    auth.uid() = user_id
  );

-- Policy: Users can update only their own notifications (e.g., mark as read)
CREATE POLICY notifications_update_policy ON public.notifications
  FOR UPDATE
  USING (
    auth.uid() = user_id
  )
  WITH CHECK (
    auth.uid() = user_id
  );

-- Policy: Users can delete their own notifications
CREATE POLICY notifications_delete_policy ON public.notifications
  FOR DELETE
  USING (
    auth.uid() = user_id
  );

-- ============================================================================
-- Comments and Documentation
-- ============================================================================

COMMENT ON TABLE public.friends IS 'Manages bidirectional friend relationships with status tracking';
COMMENT ON COLUMN public.friends.status IS 'Friend request status: pending, accepted, rejected, blocked';
COMMENT ON COLUMN public.friends.user_id IS 'User who initiated the friend request';
COMMENT ON COLUMN public.friends.friend_id IS 'User who received the friend request';

COMMENT ON TABLE public.agree_questions IS 'Stores questions between friends with agree/disagree answers';
COMMENT ON COLUMN public.agree_questions.asker_id IS 'User who asked the question';
COMMENT ON COLUMN public.agree_questions.responder_id IS 'User who should answer the question';
COMMENT ON COLUMN public.agree_questions.asker_answer IS 'Asker''s own answer (true=agree, false=disagree, null=not answered)';
COMMENT ON COLUMN public.agree_questions.responder_answer IS 'Responder''s answer (true=agree, false=disagree, null=not answered)';
COMMENT ON COLUMN public.agree_questions.status IS 'Question status: pending, answered, skipped';

COMMENT ON TABLE public.notifications IS 'User notifications for friend and question activities';
COMMENT ON COLUMN public.notifications.type IS 'Notification type: friend_request, friend_accepted, question_received, question_answered';
COMMENT ON COLUMN public.notifications.content IS 'JSON content with notification details (flexible schema)';
COMMENT ON COLUMN public.notifications.is_read IS 'Whether the notification has been read by the user';
