
CREATE TABLE public.mining_stats (
  daily_comments_count integer DEFAULT 0,
  daily_posts_count integer DEFAULT 0,
  updated_at timestamp with time zone DEFAULT now(),
  created_at timestamp with time zone DEFAULT now(),
  last_activity_at timestamp with time zone DEFAULT now(),
  total_points integer DEFAULT 0,
  daily_tokens_earned numeric DEFAULT 0,
  user_id uuid NOT NULL,
  daily_likes_count integer DEFAULT 0,
  daily_points integer DEFAULT 0,
  total_tokens_earned numeric DEFAULT 0,
  daily_shares_count integer DEFAULT 0,
  daily_invites_count integer DEFAULT 0,
  daily_reset_at timestamp with time zone DEFAULT now(),
  is_mining boolean DEFAULT false,
  last_heartbeat timestamp with time zone DEFAULT now(),
  PRIMARY KEY (user_id)
);

ALTER TABLE public.mining_stats ENABLE ROW LEVEL SECURITY;
