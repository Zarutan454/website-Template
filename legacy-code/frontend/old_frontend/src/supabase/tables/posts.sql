
CREATE TABLE public.posts (
  video_url text,
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  author_id uuid NOT NULL,
  likes_count integer DEFAULT 0,
  comments_count integer DEFAULT 0,
  shares_count integer DEFAULT 0,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  content text NOT NULL,
  media_url text,
  media_type text,
  hashtags text[]
);

ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;
