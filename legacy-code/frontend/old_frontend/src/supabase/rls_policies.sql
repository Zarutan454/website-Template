
-- Row Level Security (RLS) policies for conversations table

-- Allow users to view conversations they are part of
CREATE POLICY "Users can view their own conversations"
ON public.conversations
FOR SELECT
USING (auth.uid() = creator_id OR auth.uid() = recipient_id);

-- Allow users to create conversations where they are the creator
CREATE POLICY "Users can create their own conversations"
ON public.conversations
FOR INSERT
WITH CHECK (auth.uid() = creator_id);

-- Allow users to update conversations they are part of
CREATE POLICY "Users can update their own conversations"
ON public.conversations
FOR UPDATE
USING (auth.uid() = creator_id OR auth.uid() = recipient_id);

-- Row Level Security (RLS) policies for messages table

-- Allow users to view messages in conversations they are part of
CREATE POLICY "Users can view messages in their conversations"
ON public.messages
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.conversations
    WHERE id = conversation_id
    AND (creator_id = auth.uid() OR recipient_id = auth.uid())
  )
);

-- Allow users to insert messages in conversations they are part of
CREATE POLICY "Users can insert messages in their conversations"
ON public.messages
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.conversations
    WHERE id = conversation_id
    AND (creator_id = auth.uid() OR recipient_id = auth.uid())
  )
  AND sender_id = auth.uid()
);

-- Allow users to update their own messages
CREATE POLICY "Users can update their own messages"
ON public.messages
FOR UPDATE
USING (sender_id = auth.uid());

-- Allow users to mark messages as read in conversations they are part of
CREATE POLICY "Users can mark messages as read"
ON public.messages
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.conversations
    WHERE id = conversation_id
    AND (creator_id = auth.uid() OR recipient_id = auth.uid())
  )
  AND read = true
  AND sender_id != auth.uid()
);
