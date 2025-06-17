
CREATE TABLE public.user_notification_settings (
  push_enabled boolean DEFAULT true,
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  email_enabled boolean DEFAULT false,
  mentions_enabled boolean DEFAULT true,
  follows_enabled boolean DEFAULT true,
  comments_enabled boolean DEFAULT true,
  likes_enabled boolean DEFAULT false,
  new_posts_enabled boolean DEFAULT true,
  group_activity_enabled boolean DEFAULT true,
  mining_rewards_enabled boolean DEFAULT true,
  system_updates_enabled boolean DEFAULT true,
  updated_at timestamp with time zone DEFAULT now(),
  created_at timestamp with time zone DEFAULT now()
);

ALTER TABLE public.user_notification_settings ENABLE ROW LEVEL SECURITY;
