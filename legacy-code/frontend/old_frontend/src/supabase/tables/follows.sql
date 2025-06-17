
CREATE TABLE public.follows (
  following_id uuid NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  follower_id uuid NOT NULL
);

ALTER TABLE public.follows ENABLE ROW LEVEL SECURITY;
