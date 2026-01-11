// Status types
export type FriendStatus = 'pending' | 'accepted' | 'rejected';
export type QuestionStatus = 'pending' | 'answered' | 'expired';
export type NotificationType = 'friend_request' | 'new_question' | 'question_answered';

// Friend relationship types
export interface Friend {
  id: string;
  user_id: string;
  friend_id: string;
  status: FriendStatus;
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
  /** Array of answer options. Database stores as JSONB but always contains string[] */
  options: string[];
  answer: string | null;
  status: QuestionStatus;
  answered_at: string | null;
  created_at: string;
}

// Notification types
export interface Notification {
  id: string;
  user_id: string;
  type: NotificationType;
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

// Input types for creating records
export interface CreateFriendInput {
  friend_id: string;
  // status is always 'pending' on creation, enforced by RLS
  // user_id comes from auth.uid()
}

export interface CreateAgreeQuestionInput {
  application_id: string;
  to_user_id: string;
  question_text: string;
  options: string[];
  // from_user_id filled from auth.uid()
  // status is always 'pending' on creation
}

export interface UpdateAgreeQuestionInput {
  answer: string;
  // Only field user can update, other fields immutable per spec
}

export interface CreateNotificationInput {
  user_id: string;
  type: NotificationType;
  title: string;
  content: string;
  link?: string;
}

export interface UpdateNotificationInput {
  read: boolean;
  // Only field user can update
}
