
CREATE TABLE public.photo_albums (
  created_at timestamp with time zone DEFAULT now() NOT NULL,
  updated_at timestamp with time zone DEFAULT now() NOT NULL,
  visibility text DEFAULT 'public',
  title text NOT NULL,
  description text,
  cover_url text,
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  photo_count integer DEFAULT 0
);

ALTER TABLE public.photo_albums ENABLE ROW LEVEL SECURITY;
