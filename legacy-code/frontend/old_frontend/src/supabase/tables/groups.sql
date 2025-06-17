
CREATE TABLE public.groups (
  banner_url text,
  avatar_url text,
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  is_private boolean DEFAULT false,
  created_by uuid NOT NULL,
  created_at timestamp with time zone DEFAULT now() NOT NULL,
  updated_at timestamp with time zone DEFAULT now() NOT NULL,
  posts_count integer DEFAULT 0,
  member_count integer DEFAULT 0,
  description text,
  name text NOT NULL
);

ALTER TABLE public.groups ENABLE ROW LEVEL SECURITY;
