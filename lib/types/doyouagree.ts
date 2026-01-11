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
