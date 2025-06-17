
CREATE TABLE public.bookmarks (
  user_id uuid NOT NULL,
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at timestamp with time zone DEFAULT now(),
  post_id uuid NOT NULL
);

ALTER TABLE public.bookmarks ENABLE ROW LEVEL SECURITY;
