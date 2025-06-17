
CREATE TABLE public.mining_sessions (
  created_at timestamp with time zone DEFAULT now() NOT NULL,
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  status text DEFAULT 'active',
  start_time timestamp with time zone DEFAULT now() NOT NULL,
  end_time timestamp with time zone,
  updated_at timestamp with time zone DEFAULT now()
);

ALTER TABLE public.mining_sessions ENABLE ROW LEVEL SECURITY;

-- Allow users to read their own mining sessions
CREATE POLICY "Users can view own sessions"
ON public.mining_sessions
FOR SELECT
USING (auth.uid() = user_id);

-- Allow users to insert their own sessions
CREATE POLICY "Users can start own sessions"
ON public.mining_sessions
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Allow users to update their own sessions
CREATE POLICY "Users can update own sessions"
ON public.mining_sessions
FOR UPDATE
USING (auth.uid() = user_id);

