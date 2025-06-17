
CREATE TABLE public.group_posts (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at timestamp with time zone DEFAULT now() NOT NULL,
  group_id uuid NOT NULL,
  post_id uuid NOT NULL
);

ALTER TABLE public.group_posts ENABLE ROW LEVEL SECURITY;
