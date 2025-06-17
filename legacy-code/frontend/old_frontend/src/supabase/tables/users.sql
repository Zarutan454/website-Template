
CREATE TABLE public.users (
  updated_at timestamp with time zone DEFAULT now(),
  followers_count integer DEFAULT 0,
  following_count integer DEFAULT 0,
  cover_url text,
  username text NOT NULL,
  avatar_url text,
  display_name text,
  bio text,
  wallet_address text,
  social_links jsonb DEFAULT '{}'::jsonb,
  id uuid PRIMARY KEY,
  created_at timestamp with time zone DEFAULT now()
);

ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
