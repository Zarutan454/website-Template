
CREATE TABLE public.album_photos (
  photo_url text NOT NULL,
  user_id uuid NOT NULL,
  updated_at timestamp with time zone DEFAULT now() NOT NULL,
  created_at timestamp with time zone DEFAULT now() NOT NULL,
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  album_id uuid NOT NULL,
  description text,
  title text
);

ALTER TABLE public.album_photos ENABLE ROW LEVEL SECURITY;
