
CREATE TABLE public.group_members (
  joined_at timestamp with time zone DEFAULT now() NOT NULL,
  role text NOT NULL,
  user_id uuid NOT NULL,
  group_id uuid NOT NULL,
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY
);

ALTER TABLE public.group_members ENABLE ROW LEVEL SECURITY;
