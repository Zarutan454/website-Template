
CREATE TABLE public.comments (
  content text NOT NULL,
  user_id uuid,
  post_id uuid NOT NULL,
  author_id uuid NOT NULL,
  likes_count integer DEFAULT 0,
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  updated_at timestamp with time zone DEFAULT now(),
  created_at timestamp with time zone DEFAULT now()
);

ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;
