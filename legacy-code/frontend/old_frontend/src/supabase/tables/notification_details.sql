
CREATE TABLE public.notification_details (
  type text,
  content text,
  id uuid,
  user_id uuid,
  read boolean,
  actor_id uuid,
  target_id uuid,
  created_at timestamp with time zone,
  updated_at timestamp with time zone,
  actor_avatar_url text,
  actor_display_name text,
  actor_username text,
  target_type text
);

ALTER TABLE public.notification_details ENABLE ROW LEVEL SECURITY;
