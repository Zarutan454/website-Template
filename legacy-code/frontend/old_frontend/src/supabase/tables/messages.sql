
CREATE TABLE public.messages (
  updated_at timestamp with time zone DEFAULT now(),
  created_at timestamp with time zone DEFAULT now(),
  read boolean DEFAULT false,
  sender_id uuid NOT NULL,
  conversation_id uuid NOT NULL,
  content text NOT NULL,
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY
);

ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
