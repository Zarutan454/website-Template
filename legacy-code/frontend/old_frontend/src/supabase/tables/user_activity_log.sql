
CREATE TABLE public.user_activity_log (
  created_at timestamp with time zone DEFAULT now(),
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid,
  target_id uuid,
  points integer DEFAULT 0,
  updated_at timestamp with time zone DEFAULT now(),
  activity_type text NOT NULL,
  target_type text
);

ALTER TABLE public.user_activity_log ENABLE ROW LEVEL SECURITY;
