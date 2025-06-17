
-- Row Level Security (RLS) policies for unread_messages_count view

-- Allow users to view unread message counts for conversations they are part of
CREATE POLICY "Users can view their unread message counts"
ON public.unread_messages_count
FOR SELECT
USING (user_id = auth.uid());

-- Allow the system to update unread message counts
CREATE POLICY "System can update unread message counts"
ON public.unread_messages_count
FOR ALL
USING (true);

-- Create a function to keep unread_messages_count updated
CREATE OR REPLACE FUNCTION public.update_unread_messages_count()
RETURNS TRIGGER AS $$
BEGIN
  -- For new messages, increment unread_count for the recipient
  IF TG_OP = 'INSERT' THEN
    -- Get the conversation details
    DECLARE
      creator_id uuid;
      recipient_id uuid;
    BEGIN
      SELECT c.creator_id, c.recipient_id INTO creator_id, recipient_id
      FROM conversations c
      WHERE c.id = NEW.conversation_id;
      
      -- Determine the recipient (the user who didn't send the message)
      IF NEW.sender_id = creator_id THEN
        -- Update or insert count for recipient
        INSERT INTO unread_messages_count (conversation_id, user_id, sender_id, unread_count)
        VALUES (NEW.conversation_id, recipient_id, NEW.sender_id, 1)
        ON CONFLICT (conversation_id, user_id)
        DO UPDATE SET unread_count = unread_messages_count.unread_count + 1;
      ELSE
        -- Update or insert count for creator
        INSERT INTO unread_messages_count (conversation_id, user_id, sender_id, unread_count)
        VALUES (NEW.conversation_id, creator_id, NEW.sender_id, 1)
        ON CONFLICT (conversation_id, user_id)
        DO UPDATE SET unread_count = unread_messages_count.unread_count + 1;
      END IF;
    END;
  
  -- When messages are marked as read, reset the unread_count
  ELSIF TG_OP = 'UPDATE' AND NEW.read = true AND OLD.read = false THEN
    -- Get the conversation details
    DECLARE
      recipient_id uuid;
    BEGIN
      -- Determine the recipient (the user who didn't send the message)
      -- This is the user who would be marking messages as read
      IF EXISTS (
        SELECT 1 FROM conversations 
        WHERE id = NEW.conversation_id AND creator_id = NEW.sender_id
      ) THEN
        SELECT recipient_id INTO recipient_id
        FROM conversations
        WHERE id = NEW.conversation_id;
      ELSE
        SELECT creator_id INTO recipient_id
        FROM conversations
        WHERE id = NEW.conversation_id;
      END IF;
      
      -- Update the unread count
      UPDATE unread_messages_count
      SET unread_count = 0
      WHERE conversation_id = NEW.conversation_id
      AND user_id != NEW.sender_id;
    END;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger on messages table
CREATE TRIGGER update_unread_messages_count_trigger
AFTER INSERT OR UPDATE ON public.messages
FOR EACH ROW
EXECUTE FUNCTION public.update_unread_messages_count();
