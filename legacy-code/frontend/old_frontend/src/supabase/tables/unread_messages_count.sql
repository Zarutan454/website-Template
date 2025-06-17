
CREATE TABLE public.unread_messages_count (
  unread_count bigint,
  conversation_id uuid,
  sender_id uuid,
  user_id uuid
);

ALTER TABLE public.unread_messages_count ENABLE ROW LEVEL SECURITY;
