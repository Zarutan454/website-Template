
CREATE TABLE public.user_search (
  bio text,
  followers_count integer,
  id uuid,
  username text,
  display_name text,
  avatar_url text
);

ALTER TABLE public.user_search ENABLE ROW LEVEL SECURITY;
