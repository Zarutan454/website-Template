
CREATE TABLE public.reports (
  created_at timestamp with time zone DEFAULT now() NOT NULL,
  user_id uuid NOT NULL,
  status text DEFAULT 'pending',
  resolver_id uuid,
  target_id uuid NOT NULL,
  author_id uuid,
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  resolved_at timestamp with time zone,
  target_type text NOT NULL,
  reason text NOT NULL
);

ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;
