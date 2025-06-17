
CREATE TABLE public.tokens (
  updated_at timestamp with time zone DEFAULT now(),
  decimals integer DEFAULT 18 NOT NULL,
  total_supply numeric NOT NULL,
  creator_id uuid NOT NULL,
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  discord_url text,
  telegram_url text,
  twitter_url text,
  website_url text,
  features text[],
  description text,
  symbol text NOT NULL,
  name text NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  contract_address text,
  network text NOT NULL
);

ALTER TABLE public.tokens ENABLE ROW LEVEL SECURITY;
