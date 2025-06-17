
CREATE TABLE public.mining_status_history (
  change_reason text,
  changed_at timestamp with time zone DEFAULT now() NOT NULL,
  created_at timestamp with time zone DEFAULT now() NOT NULL,
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  new_status boolean NOT NULL,
  previous_status boolean NOT NULL,
  user_id uuid NOT NULL
);

ALTER TABLE public.mining_status_history ENABLE ROW LEVEL SECURITY;
