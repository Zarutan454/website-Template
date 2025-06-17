
CREATE TABLE public.user_followers (
  user_id uuid,
  follower_id uuid,
  created_at timestamp with time zone DEFAULT now(),
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY
);

ALTER TABLE public.user_followers ENABLE ROW LEVEL SECURITY;
