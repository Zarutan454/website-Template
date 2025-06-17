
CREATE TABLE public.likes (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  comment_id uuid,
  post_id uuid,
  created_at timestamp with time zone DEFAULT now()
);

ALTER TABLE public.likes ENABLE ROW LEVEL SECURITY;
