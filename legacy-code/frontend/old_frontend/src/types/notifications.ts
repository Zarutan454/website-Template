
export interface Notification {
  id: string;
  user_id: string;
  type: NotificationType;
  content: string;
  read: boolean;
  actor_id: string | null;
  actor_username: string | null;
  actor_display_name: string | null;
  actor_avatar_url: string | null;
  target_id: string | null;
  target_type: string | null;
  created_at: string;
  updated_at: string;
}

export type NotificationType = 
  | 'like'
  | 'comment'
  | 'follow' 
  | 'mention'
  | 'post_activity'
  | 'mining_reward'
  | 'post_share'
  | 'system';
