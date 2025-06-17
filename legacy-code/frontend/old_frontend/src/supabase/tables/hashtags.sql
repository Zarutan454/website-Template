
CREATE TABLE public.hashtags (
  created_at timestamp with time zone DEFAULT now(),
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  updated_at timestamp with time zone DEFAULT now(),
  name text NOT NULL,
  post_count integer DEFAULT 0
);

ALTER TABLE public.hashtags ENABLE ROW LEVEL SECURITY;
