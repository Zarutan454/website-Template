
CREATE TABLE public.notifications (
  type text NOT NULL,
  read boolean DEFAULT false,
  actor_id uuid,
  target_id uuid,
  created_at timestamp with time zone DEFAULT now(),
  target_type text,
  updated_at timestamp with time zone DEFAULT now(),
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  content text NOT NULL
);

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
