
CREATE TABLE public.user_relationships (
  related_user_id uuid NOT NULL,
  created_at timestamp with time zone DEFAULT now() NOT NULL,
  relationship_type text NOT NULL,
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  updated_at timestamp with time zone DEFAULT now() NOT NULL
);

ALTER TABLE public.user_relationships ENABLE ROW LEVEL SECURITY;
