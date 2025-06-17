
CREATE TABLE public.mining_activities (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  activity_type text NOT NULL,
  updated_at timestamp with time zone DEFAULT now(),
  created_at timestamp with time zone DEFAULT now(),
  tokens_earned numeric DEFAULT 0,
  points integer DEFAULT 0,
  user_id uuid
);

ALTER TABLE public.mining_activities ENABLE ROW LEVEL SECURITY;
